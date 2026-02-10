const { Collection, User, CollectionMember, Item, WorkspaceMember } = require('../../models');
const { Op } = require('sequelize');

class CollectionsService {


  async createCollection(userId, data) {
  const { name, parentId, settings } = data;

  if (!name) {
    throw new Error('Nazwa kolekcji jest wymagana');
  }

  if (parentId) {
    const hasAccess = await this.hasCollectionAccess(userId, parentId);
    
    if (!hasAccess) {
      throw new Error('Kolekcja nadrzędna nie znaleziona');
    }

    const isShared = await CollectionMember.count({
      where: { collectionId: parentId }
    });

    if (isShared > 0) {
      throw new Error('Nie można tworzyć subfolderów w shared kolekcji');
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
    throw new Error('Masz już kolekcję o tej nazwie w tym miejscu');
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
      throw new Error('Kolekcja nie znaleziona');
    }

    const hasAccess = await this.hasCollectionAccess(userId, collectionId);
    
    if (!hasAccess) {
      throw new Error('Brak dostępu do tej kolekcji');
    }

    return collection;
  }

async updateCollection(userId, collectionId, data) {
  const collection = await Collection.findOne({
    where: { id: collectionId }
  });

  if (!collection) {
    throw new Error('Kolekcja nie znaleziona');
  }

  const hasAccess = await this.hasCollectionAccess(userId, collectionId);
  
  if (!hasAccess) {
    throw new Error('Brak dostępu do tej kolekcji');
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
      throw new Error('Kolekcja o tej nazwie już istnieje');
    }
  }

  if (parentId !== undefined && parentId !== collection.parentId) {
    if (parentId) {

      const parentCollection = await Collection.findByPk(parentId);
      
      if (!parentCollection) {
        throw new Error('Kolekcja nadrzędna nie znaleziona');
      }

      const hasParentAccess = await this.hasCollectionAccess(userId, parentId);
      
      if (!hasParentAccess) {
        throw new Error('Brak dostępu do kolekcji nadrzędnej');
      }

      if (parentId === collectionId) {
        throw new Error('Kolekcja nie może być swoim rodzicem');
      }

      const parentIsShared = await CollectionMember.count({
        where: { collectionId: parentId }
      });

      if (parentIsShared > 0) {
        throw new Error('Nie można tworzyć subfolderów w shared kolekcji');
      }

      const isShared = await CollectionMember.count({
        where: { collectionId: collection.id }
      });

      if (isShared > 0) {
        throw new Error('Nie można zagnieżdżać shared kolekcji');
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
    
    console.log('hasCollectionAccess:', {
      userId,
      collectionId,
      collection: collection ? {
        ownerId: collection.ownerId,
        workspaceId: collection.workspaceId
      } : null
    });
    
    if (!collection) {
      return false;
    }

    if (collection.ownerId === userId) {
      console.log('User jest ownerem');
      return true;
    }

    if (collection.workspaceId) {
      console.log('Sprawdzam workspace membership...');
      
      const member = await WorkspaceMember.findOne({
        where: {
          workspaceId: collection.workspaceId,
          userId
        }
      });

      console.log('Workspace member:', member ? {
        role: member.role,
        workspaceId: member.workspaceId
      } : null);

      if (member) {
        console.log('User jest członkiem workspace!');
        return true;
      }
    }

    const memberRecord = await CollectionMember.findOne({
      where: {
        collectionId,
        userId
      }
    });

    console.log('Collection member:', memberRecord ? 'YES' : 'NO');

    return !!memberRecord;
  }

  async restoreCollection(userId, collectionId) {
    const collection = await Collection.findOne({
      where: { id: collectionId },
      paranoid: false
    });

    if (!collection) {
      throw new Error('Kolekcja nie znaleziona');
    }

    if (!collection.deletedAt) {
      throw new Error('Kolekcja nie jest usunięta');
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
        throw new Error('Tylko admin może przywracać kolekcje');
      }
    } else {
      if (collection.ownerId !== userId) {
        throw new Error('Brak uprawnień');
      }
    }

    await collection.restore();

    return { message: 'Kolekcja przywrócona' };
  }

  async getCollectionItems(userId, collectionId) {
    const collection = await Collection.findByPk(collectionId);

    if (!collection) {
      throw new Error('Kolekcja nie znaleziona');
    }

    const hasAccess = await this.hasCollectionAccess(userId, collectionId);
    
    if (!hasAccess) {
      throw new Error('Brak dostępu do tej kolekcji');
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