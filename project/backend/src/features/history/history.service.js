const { ItemHistory, Item, User, WorkspaceMember, Collection } = require('../../models');
const { checkPermission } = require('../../shared/constants/permissions');

class HistoryService {

  async getMemberForItem(userId, item) {
    if (!item.collection || !item.collection.workspaceId) {
      return null; 
    }

    return await WorkspaceMember.findOne({
      where: {
        workspaceId: item.collection.workspaceId,
        userId
      }
    });
  }

  async getHistory(userId, itemId) {
    const item = await Item.findByPk(itemId, {
      include: [
        {
          model: Collection,
          as: 'collection',
          attributes: ['id', 'workspaceId']
        }
      ]
    });

    if (!item) {
      throw new Error('Item nie znaleziony');
    }

    if (!item.collection || !item.collection.workspaceId) {
      if (item.userId !== userId) {
        throw new Error('Brak dostępu do itemu');
      }
      return [];
    }

    const member = await this.getMemberForItem(userId, item);
    checkPermission('VIEW_HISTORY', member);

    const history = await ItemHistory.findAll({
      where: {
        itemId,
        workspaceId: item.collection.workspaceId
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['version', 'DESC']]
    });

    return history;
  }

  async getVersion(userId, itemId, version) {
    const item = await Item.findByPk(itemId, {
      include: [
        {
          model: Collection,
          as: 'collection',
          attributes: ['id', 'workspaceId']
        }
      ]
    });

    if (!item) {
      throw new Error('Item nie znaleziony');
    }

    if (!item.collection || !item.collection.workspaceId) {
      if (item.userId !== userId) {
        throw new Error('Brak dostępu do itemu');
      }
      throw new Error('Personal items nie mają historii wersji');
    }

    const member = await this.getMemberForItem(userId, item);
    checkPermission('VIEW_HISTORY', member);

    const historyVersion = await ItemHistory.findOne({
      where: { itemId, version },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    if (!historyVersion) {
      throw new Error('Wersja nie znaleziona');
    }

    return historyVersion;
  }

  async restoreVersion(userId, itemId, version) {
    const item = await Item.findByPk(itemId, {
      include: [
        {
          model: Collection,
          as: 'collection',
          attributes: ['id', 'workspaceId']
        }
      ]
    });

    if (!item) {
      throw new Error('Item nie znaleziony');
    }

    if (!item.collection || !item.collection.workspaceId) {
      throw new Error('Restore działa tylko dla workspace items');
    }

    const member = await this.getMemberForItem(userId, item);
    checkPermission('RESTORE_VERSION', member);

    const historyVersion = await ItemHistory.findOne({
      where: { itemId, version }
    });

    if (!historyVersion) {
      throw new Error('Wersja nie znaleziona');
    }

    const oldSnapshot = item.toJSON();

    const snapshot = historyVersion.snapshot;

    await item.update({
      title: snapshot.title,
      itemType: snapshot.itemType,
      metadata: snapshot.metadata,
      year: snapshot.year,
      notes: snapshot.notes,
      favorite: snapshot.favorite
    });

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
      diff: {
        restoredFrom: version,
        changes: this.calculateDiff(oldSnapshot, item.toJSON())
      },
      changedAt: new Date()
    });

    return {
      message: `Item przywrócony do wersji ${version}`,
      currentVersion: newVersion,
      restoredFrom: version
    };
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

module.exports = new HistoryService();