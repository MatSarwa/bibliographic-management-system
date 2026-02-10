const { Item, User, Collection, Label, ItemHistory, WorkspaceMember } = require('../../models');
const { Op } = require('sequelize');
const { checkPermission, hasPermission } = require('../../shared/constants/permissions');

class ItemsService {

  async getMemberForCollection(userId, collection) {
    if (!collection || !collection.workspaceId) {
      return null;
    }

    return await WorkspaceMember.findOne({
      where: {
        workspaceId: collection.workspaceId,
        userId
      }
    });
  }

  async createItem(userId, data) {
    const {
      title,
      itemType,
      metadata,
      year,
      notes,
      favorite,
      collectionId
    } = data;

    if (!title) {
      throw new Error('Tytuł jest wymagany');
    }

    let collection = null;
    let workspaceId = null;

    if (collectionId) {
      collection = await Collection.findByPk(collectionId);
      
      if (!collection) {
        throw new Error('Kolekcja nie znaleziona');
      }

      if (collection.workspaceId) {

        workspaceId = collection.workspaceId;
        
        const member = await this.getMemberForCollection(userId, collection);
        checkPermission('CREATE_REFERENCE', member);
        
      } else {

        if (collection.ownerId !== userId) {
          throw new Error('Brak dostępu do kolekcji');
        }
      }
    }

    const item = await Item.create({
      userId: userId,
      collectionId: collection ? collection.id : null,
      title,
      itemType: itemType || 'article',
      metadata: metadata || {},
      year: year || null,
      notes: notes || null,
      favorite: favorite || false,
      status: 'active',
      dateAdded: new Date()
    });

    if (workspaceId) {
      await ItemHistory.create({
        itemId: item.id,
        workspaceId: workspaceId,
        version: 1,
        changedBy: userId,
        changeType: 'created',
        snapshot: item.toJSON(),
        diff: null,
        changedAt: new Date()
      });
    }

    return item;
  }

  async getAllItems(userId, filters = {}) {
    const { favorite, itemType, year, search, workspaceId } = filters;

    const whereConditions = {
      status: 'active'
    };

    const includeConditions = [];

    if (workspaceId) {
      const member = await WorkspaceMember.findOne({
        where: { workspaceId, userId }
      });

      checkPermission('VIEW_REFERENCES', member);

      includeConditions.push({
        model: Collection,
        as: 'collection',
        where: { workspaceId },
        required: true
      });
    } else {

      whereConditions.userId = userId;
      
      includeConditions.push({
        model: Collection,
        as: 'collection',
        where: { workspaceId: null },
        required: false
      });
    }

    includeConditions.push({
      model: Label,
      as: 'labels',
      through: { attributes: [] }
    });

    if (favorite !== undefined) {
      whereConditions.favorite = favorite === 'true' || favorite === true;
    }

    if (itemType) {
      whereConditions.itemType = itemType;
    }

    if (year) {
      whereConditions.year = parseInt(year);
    }

    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { notes: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const items = await Item.findAll({
      where: whereConditions,
      include: includeConditions,
      order: [['dateAdded', 'DESC']]
    });

    return items;
  }

  async getFavorites(userId) {
    const items = await Item.findAll({
      where: {
        userId: userId,
        status: 'active',
        favorite: true
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

  async getTrash(userId) {
    const items = await Item.findAll({
      where: {
        userId: userId,
        status: 'trashed'
      },
      include: [
        {
          model: Label,
          as: 'labels',
          through: { attributes: [] }
        }
      ],
      order: [['deletedAt', 'DESC']]
    });

    return items;
  }

  async getItemById(userId, itemId) {
    const item = await Item.findByPk(itemId, {
      include: [
        {
          model: Label,
          as: 'labels',
          through: { attributes: [] }
        },
        {
          model: Collection,
          as: 'collection',
          attributes: ['id', 'name', 'workspaceId'],
          required: false
        }
      ]
    });

    if (!item) {
      throw new Error('Item nie znaleziony');
    }

    if (item.collection?.workspaceId) {
      const member = await this.getMemberForCollection(userId, item.collection);
      checkPermission('VIEW_REFERENCES', member);
    } else {
      if (item.userId !== userId) {
        throw new Error('Brak dostępu do itemu');
      }
    }

    return item;
  }

  async updateItem(userId, itemId, data) {
    const item = await Item.findOne({
      where: {
        id: itemId,
        status: 'active'
      },
      include: [
        {
          model: Collection,
          as: 'collection',
          attributes: ['id', 'workspaceId'],
          required: false
        }
      ]
    });

    if (!item) {
      throw new Error('Item nie znaleziony');
    }

    if (item.collection?.workspaceId) {
      const member = await this.getMemberForCollection(userId, item.collection);
      checkPermission('UPDATE_REFERENCE', member);
    } else {
      if (item.userId !== userId) {
        throw new Error('Brak uprawnień');
      }
    }

    const oldSnapshot = item.toJSON();

    const {
      title,
      itemType,
      metadata,
      year,
      notes,
      favorite,
      collectionId
    } = data;

    if (collectionId !== undefined && collectionId !== item.collectionId) {
      if (collectionId) {
        const collection = await Collection.findByPk(collectionId);

        if (!collection) {
          throw new Error('Kolekcja nie znaleziona');
        }
        
        if (collection.ownerId !== userId) {
          throw new Error('Brak dostępu do kolekcji');
        }
      }
    }

    await item.update({
      ...(title && { title }),
      ...(itemType && { itemType }),
      ...(metadata && { metadata }),
      ...(year !== undefined && { year }),
      ...(notes !== undefined && { notes }),
      ...(favorite !== undefined && { favorite }),
      ...(collectionId !== undefined && { collectionId })
    });

    if (item.collection?.workspaceId) {
      await this.createHistory(
        item,
        userId,
        'updated',
        oldSnapshot,
        item.toJSON(),
        item.collection.workspaceId
      );
    }

    const updatedItem = await Item.findByPk(item.id, {
      include: [
        {
          model: Label,
          as: 'labels',
          through: { attributes: [] }
        }
      ]
    });

    return updatedItem;
  }

  async moveToTrash(userId, itemId) {
    const item = await Item.findOne({
      where: {
        id: itemId,
        status: 'active'
      },
      include: [
        {
          model: Collection,
          as: 'collection',
          attributes: ['id', 'workspaceId'],
          required: false
        }
      ]
    });

    if (!item) {
      throw new Error('Item nie znaleziony');
    }

    if (item.collection?.workspaceId) {
      const member = await this.getMemberForCollection(userId, item.collection);
      checkPermission('DELETE_REFERENCE', member);
    } else {
      if (item.userId !== userId) {
        throw new Error('Brak uprawnień');
      }
    }

    const oldSnapshot = item.toJSON();

    await item.update({
      status: 'trashed',
      deletedAt: new Date()
    });

    if (item.collection?.workspaceId) {
      await this.createHistory(
        item,
        userId,
        'deleted',
        { ...oldSnapshot, status: 'active' },
        item.toJSON(),
        item.collection.workspaceId
      );
    }

    return { message: 'Item przeniesiony do kosza' };
  }

  async restoreItem(userId, itemId) {
    const item = await Item.findOne({
      where: { id: itemId },
      include: [
        {
          model: Collection,
          as: 'collection',
          attributes: ['id', 'workspaceId'],
          required: false
        }
      ]
    });

    if (!item) {
      throw new Error('Item nie znaleziony');
    }

    if (item.status !== 'trashed') {
      throw new Error('Item nie jest usunięty');
    }

    if (item.collection?.workspaceId) {
      const member = await this.getMemberForCollection(userId, item.collection);
      checkPermission('UPDATE_REFERENCE', member);
    } else {
      if (item.userId !== userId) {
        throw new Error('Brak uprawnień');
      }
    }

    await item.update({
      status: 'active',
      deletedAt: null
    });

    if (item.collection?.workspaceId) {
      const lastVersion = await ItemHistory.max('version', {
        where: { itemId }
      });
      const newVersion = (lastVersion || 0) + 1;

      await ItemHistory.create({
        itemId: item.id,
        workspaceId: item.collection.workspaceId,
        version: newVersion,
        changedBy: userId,
        changeType: 'restored',
        snapshot: item.toJSON(),
        diff: { status: { old: 'trashed', new: 'active' } },
        changedAt: new Date()
      });
    }

    return { message: 'Item przywrócony' };
  }

  async permanentDelete(userId, itemId) {
    const item = await Item.findOne({
      where: {
        id: itemId,
        status: 'trashed'
      },
      include: [
        {
          model: Collection,
          as: 'collection',
          attributes: ['id', 'workspaceId'],
          required: false
        }
      ]
    });

    if (!item) {
      throw new Error('Item nie znaleziony w koszu');
    }

    if (item.collection?.workspaceId) {

      const member = await WorkspaceMember.findOne({
        where: {
          workspaceId: item.collection.workspaceId,
          userId,
          role: 'admin'
        }
      });

      if (!member) {
        throw new Error('Tylko admin może usuwać na zawsze');
      }
    } else {
      if (item.userId !== userId) {
        throw new Error('Brak uprawnień');
      }
    }

    await item.destroy();

    return { message: 'Item usunięty na zawsze' };
  }

  async toggleFavorite(userId, itemId) {
    const item = await Item.findOne({
      where: {
        id: itemId,
        status: 'active'
      },
      include: [
        {
          model: Collection,
          as: 'collection',
          attributes: ['id', 'workspaceId'],
          required: false
        }
      ]
    });

    if (!item) {
      throw new Error('Item nie znaleziony');
    }

    if (item.collection?.workspaceId) {
      const member = await this.getMemberForCollection(userId, item.collection);
      checkPermission('UPDATE_REFERENCE', member);
    } else {
      if (item.userId !== userId) {
        throw new Error('Brak uprawnień');
      }
    }

    await item.update({
      favorite: !item.favorite
    });

    return item;
  }

  async createHistory(item, userId, changeType, oldData, newData, workspaceId) {
    const diff = this.calculateDiff(oldData, newData);

    const lastVersion = await ItemHistory.max('version', {
      where: { itemId: item.id }
    });
    const newVersion = (lastVersion || 0) + 1;

    await ItemHistory.create({
      itemId: item.id,
      workspaceId: workspaceId,
      version: newVersion,
      changedBy: userId,
      changeType,
      snapshot: newData,
      diff,
      changedAt: new Date()
    });
  }

  calculateDiff(oldData, newData) {
    const diff = {};
    const ignoreKeys = ['id', 'createdAt', 'updatedAt', 'userId', 'collectionId', 'dateAdded', 'collection'];

    Object.keys(newData).forEach(key => {
      if (ignoreKeys.includes(key)) return;

      const oldValue = oldData[key];
      const newValue = newData[key];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        diff[key] = { old: oldValue, new: newValue };
      }
    });

    return diff;
  }
}

module.exports = new ItemsService();