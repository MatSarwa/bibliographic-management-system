const { Label, ItemLabel } = require('../../models');
const { Op } = require('sequelize');

class LabelsService {
  async createLabel(userId, { name, color }) {

    const existingLabel = await Label.findOne({
      where: {
        userId,
        name
      }
    });

    if (existingLabel) {
      throw new Error('Masz już label o tej nazwie');
    }

    const label = await Label.create({
      name,
      color: color || '#9E9E9E',
      userId
    });

    return label;
  }

  async getAllLabels(userId) {
    const labels = await Label.findAll({
      where: { userId },
      order: [['createdAt', 'ASC']],
      attributes: ['id', 'name', 'color', 'createdAt', 'updatedAt']
    });

    return labels;
  }

  async getLabelById(userId, labelId) {
    const label = await Label.findOne({
      where: {
        id: labelId,
        userId
      }
    });

    if (!label) {
      throw new Error('Label nie znaleziony');
    }

    return label;
  }

  async updateLabel(userId, labelId, { name, color }) {
    const label = await Label.findOne({
      where: {
        id: labelId,
        userId
      }
    });

    if (!label) {
      throw new Error('Label nie znaleziony');
    }

    if (name && name !== label.name) {
      const existingLabel = await Label.findOne({
        where: {
          userId,
          name,
          id: { [Op.ne]: labelId }
        }
      });

      if (existingLabel) {
        throw new Error('Masz już label o tej nazwie');
      }
    }

    await label.update({
      ...(name && { name }),
      ...(color && { color })
    });

    return label;
  }

  async deleteLabel(userId, labelId) {
    const label = await Label.findOne({
      where: {
        id: labelId,
        userId
      }
    });

    if (!label) {
      throw new Error('Label nie znaleziony');
    }

    await label.destroy();

    return { message: 'Label usunięty pomyślnie' };
  }

  async getLabelStats(userId, labelId) {
    const label = await Label.findOne({
      where: {
        id: labelId,
        userId
      }
    });

    if (!label) {
      throw new Error('Label nie znaleziony');
    }

    const itemCount = await ItemLabel.count({
      where: { labelId }
    });

    return {
      ...label.toJSON(),
      itemCount
    };
  }
}

module.exports = new LabelsService();