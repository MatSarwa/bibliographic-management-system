const { ItemHistory, Item, User, WorkspaceMember, Collection } = require('../../models');
const { checkPermission } = require('../../shared/constants/permissions');
const AppError = require('../../shared/utils/app-error');

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
      throw new AppError('Nie znaleziono pozycji', 404);
    }

    if (!item.collection || !item.collection.workspaceId) {
      if (item.userId !== userId) {
        throw new AppError('Brak dostępu do tej pozycji', 403);
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
      throw new AppError('Nie znaleziono pozycji', 404);
    }

    if (!item.collection || !item.collection.workspaceId) {
      if (item.userId !== userId) {
        throw new AppError('Brak dostępu do tej pozycji', 403);
      }
      throw new AppError('Pozycje prywatne nie mają historii wersji', 400);
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
      throw new AppError('Wersja nie znaleziona', 404);
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
      throw new AppError('Nie znaleziono pozycji', 404);
    }

    if (!item.collection || !item.collection.workspaceId) {
      throw new AppError('Przywracanie wersji działa tylko dla pozycji w workspace', 400);
    }

    const member = await this.getMemberForItem(userId, item);
    checkPermission('RESTORE_VERSION', member);

    const historyVersion = await ItemHistory.findOne({
      where: { itemId, version }
    });

    if (!historyVersion) {
      throw new AppError('Wersja nie znaleziona', 404);
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
      message: `Przywrócono wersję ${version}`,
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