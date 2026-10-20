const { Collection, User, CollectionMember, Item, WorkspaceMember } = require('../../models');
const { Op } = require('sequelize');
const AppError = require('../../shared/utils/app-error');

class CollectionsService {


  async createCollection(userId, data) {
  const { name, parentId, settings } = data;

  if (!name) {
    throw new AppError('Nazwa kolekcji jest wymagana', 400);
  }

  if (parentId) {
    const hasAccess = await this.hasCollectionAccess(userId, parentId);
    
    if (!hasAccess) {
      throw new AppError('Kolekcja nadrzędna nie znaleziona', 404);
    }

    const isShared = await CollectionMember.count({
      where: { collectionId: parentId }
    });

    if (isShared > 0) {
      throw new AppError('Nie można tworzyć subfolderów w shared kolekcji', 400);
    }
  }

  const existingCollection = await Collection.findOne({
    where: {
      ownerId: userId,
      name,
      parentId: parentId || null,
      workspaceId: null
    }
  });

  if (existingCollection) {
    throw new AppError('Masz już kolekcję o tej nazwie w tym miejscu', 409);
  }

  const collection = await Collection.create({
    name,
    ownerId: userId,      
    workspaceId: null,   
    parentId: parentId || null,
    isSystemDefault: false,
    isPublic: true,
    settings: settings || { color: '#3B82F6' }
  });

  return collection;
}

  async getAllCollections(userId) {

    const ownedCollections = await Collection.findAll({
      where: {
        ownerId: userId,
        workspaceId: null  
      },
      include: [
        {
          model: CollectionMember,
          as: 'memberships',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'email']
            }
          ]
        }
      ],
      order: [
        ['createdAt', 'ASC']
      ]
    });

    const sharedCollections = await CollectionMember.findAll({
      where: { userId },
      include: [
        {
          model: Collection,
          as: 'collection',
          required: true,
          where: {
            workspaceId: null  
          },
          include: [
            {
              model: CollectionMember,
              as: 'memberships',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'username', 'email']
                }
              ]
            }
          ]
        }
      ]
    });

    const allCollections = [
      ...ownedCollections,
      ...sharedCollections.map(sc => sc.collection)
    ];

    return allCollections;
  }

  async getCollectionById(userId, collectionId) {
    const collection = await Collection.findOne({
      where: {
        id: collectionId
      },
      include: [
        {
          model: Collection,
          as: 'children',
          required: false
        }
      ]
    });

    if (!collection) {
      throw new AppError('Kolekcja nie znaleziona', 404);
    }

    const hasAccess = await this.hasCollectionAccess(userId, collectionId);
    
    if (!hasAccess) {
      throw new AppError('Brak dostępu do tej kolekcji', 403);
    }

    return collection;
  }

async updateCollection(userId, collectionId, data) {
  const collection = await Collection.findOne({
    where: { id: collectionId }
  });

  if (!collection) {
    throw new AppError('Kolekcja nie znaleziona', 404);
  }

  const hasAccess = await this.hasCollectionAccess(userId, collectionId);
  
  if (!hasAccess) {
    throw new AppError('Brak dostępu do tej kolekcji', 403);
  }

  const { name, parentId, settings, isPublic } = data;

  if (name && name !== collection.name) {
    const existingCollection = await Collection.findOne({
      where: {
        ownerId: collection.ownerId,
        name,
        parentId: parentId !== undefined ? parentId : collection.parentId,
        workspaceId: collection.workspaceId,
        id: { [Op.ne]: collectionId }
      }
    });

    if (existingCollection) {
      throw new AppError('Kolekcja o tej nazwie już istnieje', 409);
    }
  }

  if (parentId !== undefined && parentId !== collection.parentId) {
    if (parentId) {

      const parentCollection = await Collection.findByPk(parentId);
      
      if (!parentCollection) {
        throw new AppError('Kolekcja nadrzędna nie znaleziona', 404);
      }

      const hasParentAccess = await this.hasCollectionAccess(userId, parentId);
      
      if (!hasParentAccess) {
        throw new AppError('Brak dostępu do kolekcji nadrzędnej', 403);
      }

      if (parentId === collectionId) {
        throw new AppError('Kolekcja nie może być swoim rodzicem', 400);
      }

      const parentIsShared = await CollectionMember.count({
        where: { collectionId: parentId }
      });

      if (parentIsShared > 0) {
        throw new AppError('Nie można tworzyć subfolderów w shared kolekcji', 400);
      }

      const isShared = await CollectionMember.count({
        where: { collectionId: collection.id }
      });

      if (isShared > 0) {
        throw new AppError('Nie można zagnieżdżać shared kolekcji', 400);
      }
    }
  }

  await collection.update({
    ...(name && { name }),
    ...(parentId !== undefined && { parentId }),
    ...(settings && { settings }),
    ...(isPublic !== undefined && { isPublic })
  });

  return collection;
}

  async getCollectionTree(userId) {
    
    const ownedCollections = await Collection.findAll({
      where: {
        ownerId: userId,
        workspaceId: null  
      },
      order: [
        ['createdAt', 'ASC']
      ]
    });

    const sharedCollections = await CollectionMember.findAll({
      where: { userId },
      include: [
        {
          model: Collection,
          as: 'collection',
          required: true,
          where: {
            workspaceId: null  
          }
        }
      ]
    });

    const allCollections = [
      ...ownedCollections,
      ...sharedCollections.map(sc => sc.collection)
    ];

    const tree = [];
    const collectionsMap = {};

    allCollections.forEach(col => {
      collectionsMap[col.id] = {
        ...col.toJSON(),
        children: []
      };
    });

    allCollections.forEach(col => {
      if (col.parentId) {
        if (collectionsMap[col.parentId]) {
          collectionsMap[col.parentId].children.push(collectionsMap[col.id]);
        }
      } else {
        tree.push(collectionsMap[col.id]);
      }
    });

    return tree;
  }

  async hasCollectionAccess(userId, collectionId) {
    const collection = await Collection.findByPk(collectionId);
    
    
    if (!collection) {
      return false;
    }

    if (collection.ownerId === userId) {
      return true;
    }

    if (collection.workspaceId) {
      
      const member = await WorkspaceMember.findOne({
        where: {
          workspaceId: collection.workspaceId,
          userId
        }
      });


      if (member) {
        return true;
      }
    }

    const memberRecord = await CollectionMember.findOne({
      where: {
        collectionId,
        userId
      }
    });


    return !!memberRecord;
  }

  async restoreCollection(userId, collectionId) {
    const collection = await Collection.findOne({
      where: { id: collectionId },
      paranoid: false
    });

    if (!collection) {
      throw new AppError('Kolekcja nie znaleziona', 404);
    }

    if (!collection.deletedAt) {
      throw new AppError('Kolekcja nie jest usunięta', 400);
    }

    if (collection.workspaceId) {
      const member = await WorkspaceMember.findOne({
        where: {
          workspaceId: collection.workspaceId,
          userId,
          role: 'admin'
        }
      });

      if (!member) {
        throw new AppError('Tylko admin może przywracać kolekcje', 403);
      }
    } else {
      if (collection.ownerId !== userId) {
        throw new AppError('Brak uprawnień', 403);
      }
    }

    await collection.restore();

    return { message: 'Kolekcja przywrócona' };
  }

  async getCollectionItems(userId, collectionId) {
    const collection = await Collection.findByPk(collectionId);

    if (!collection) {
      throw new AppError('Kolekcja nie znaleziona', 404);
    }

    const hasAccess = await this.hasCollectionAccess(userId, collectionId);
    
    if (!hasAccess) {
      throw new AppError('Brak dostępu do tej kolekcji', 403);
    }

    const { Label } = require('../../models');
    
    const items = await Item.findAll({
      where: {
        collectionId,
        status: 'active'
      },
      include: [
        {
          model: Label,
          as: 'labels',
          through: { attributes: [] }
        }
      ],
      order: [['dateAdded', 'DESC']]
    });

    return items;
  }
}

module.exports = new CollectionsService();