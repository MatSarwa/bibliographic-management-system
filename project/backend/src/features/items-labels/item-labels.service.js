const { Item, Label, ItemLabel, Collection, WorkspaceMember } = require('../../models');

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
      throw new Error('Item nie znaleziony');
    }

    await this.checkItemAccess(userId, item);

    const label = await Label.findOne({
      where: {
        id: labelId,
        userId
      }
    });

    if (!label) {
      throw new Error('Label nie znaleziony');
    }

    const existing = await ItemLabel.findOne({
      where: {
        itemId,
        labelId
      }
    });

    if (existing) {
      throw new Error('Label jest już przypisany do tego itemu');
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
      throw new Error('Item nie znaleziony');
    }

    await this.checkItemAccess(userId, item);

    const label = await Label.findOne({
      where: {
        id: labelId,
        userId
      }
    });

    if (!label) {
      throw new Error('Label nie znaleziony');
    }

    const deleted = await ItemLabel.destroy({
      where: {
        itemId,
        labelId
      }
    });

    if (deleted === 0) {
      throw new Error('Label nie był przypisany do tego itemu');
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
      throw new Error('Label nie znaleziony');
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
      throw new Error('Item nie znaleziony');
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
    console.log('setItemLabels:', { userId, itemId, labelIds });

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
      throw new Error('Item nie znaleziony');
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
        throw new Error('Niektóre labels nie zostały znalezione');
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
        throw new Error('Brak dostępu do workspace');
      }

      if (member.role === 'viewer') {
        throw new Error('Viewer nie może edytować labels');
      }
    } else {

      if (item.userId !== userId) {
        throw new Error('Brak dostępu do itemu');
      }
    }
  }
}

module.exports = new ItemLabelsService();