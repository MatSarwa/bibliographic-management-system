const { Item, Label, ItemLabel, Collection, WorkspaceMember } = require('../../models');
const AppError = require('../../shared/utils/app-error');

class ItemLabelsService {
  async addLabelToItem(userId, itemId, labelId) {

    const item = await Item.findOne({
      where: {
        id: itemId,
        status: 'active'
      },
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

    await this.checkItemAccess(userId, item);

    const label = await Label.findOne({
      where: {
        id: labelId,
        userId
      }
    });

    if (!label) {
      throw new AppError('Label nie znaleziony', 404);
    }

    const existing = await ItemLabel.findOne({
      where: {
        itemId,
        labelId
      }
    });

    if (existing) {
      throw new AppError('Ta etykieta jest już przypisana do tej pozycji', 409);
    }

    await ItemLabel.create({
      itemId,
      labelId
    });

    const updatedItem = await Item.findByPk(itemId, {
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

  async removeLabelFromItem(userId, itemId, labelId) {

    const item = await Item.findOne({
      where: {
        id: itemId,
        status: 'active'
      },
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

    await this.checkItemAccess(userId, item);

    const label = await Label.findOne({
      where: {
        id: labelId,
        userId
      }
    });

    if (!label) {
      throw new AppError('Label nie znaleziony', 404);
    }

    const deleted = await ItemLabel.destroy({
      where: {
        itemId,
        labelId
      }
    });

    if (deleted === 0) {
      throw new AppError('Ta etykieta nie była przypisana do tej pozycji', 404);
    }

    const updatedItem = await Item.findByPk(itemId, {
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

  async getItemsByLabel(userId, labelId) {

    const label = await Label.findOne({
      where: {
        id: labelId,
        userId
      }
    });

    if (!label) {
      throw new AppError('Label nie znaleziony', 404);
    }

    const items = await Item.findAll({
      where: {
        userId,
        status: 'active'
      },
      include: [
        {
          model: Label,
          as: 'labels',
          where: { id: labelId },
          through: { attributes: [] }
        }
      ],
      order: [['dateAdded', 'DESC']]
    });

    return items;
  }

  async getItemLabels(userId, itemId) {

    const item = await Item.findOne({
      where: {
        id: itemId
      },
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

    await this.checkItemAccess(userId, item);

    const labels = await Label.findAll({
      include: [
        {
          model: Item,
          as: 'items',
          where: { id: itemId },
          through: { attributes: [] },
          attributes: []
        }
      ],
      where: { userId }
    });

    return labels;
  }

  async setItemLabels(userId, itemId, labelIds) {

    const item = await Item.findOne({
      where: {
        id: itemId,
        status: 'active'
      },
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

    await this.checkItemAccess(userId, item);

    if (labelIds && labelIds.length > 0) {
      const labels = await Label.findAll({
        where: {
          id: labelIds,
          userId
        }
      });

      if (labels.length !== labelIds.length) {
        throw new AppError('Niektóre labels nie zostały znalezione', 400);
      }
    }

    await ItemLabel.destroy({
      where: { itemId }
    });

    if (labelIds && labelIds.length > 0) {
      const itemLabels = labelIds.map(labelId => ({
        itemId,
        labelId
      }));

      await ItemLabel.bulkCreate(itemLabels);
    }

    const updatedItem = await Item.findByPk(itemId, {
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

  async checkItemAccess(userId, item) {
    if (item.collection?.workspaceId) {

      const member = await WorkspaceMember.findOne({
        where: {
          workspaceId: item.collection.workspaceId,
          userId
        }
      });

      if (!member) {
        throw new AppError('Brak dostępu do workspace', 403);
      }

      if (member.role === 'viewer') {
        throw new AppError('Viewer nie może edytować labels', 403);
      }
    } else {

      if (item.userId !== userId) {
        throw new AppError('Brak dostępu do tej pozycji', 403);
      }
    }
  }
}

module.exports = new ItemLabelsService();