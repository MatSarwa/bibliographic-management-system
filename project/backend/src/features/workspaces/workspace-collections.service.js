const { Collection, Item, Label, WorkspaceMember } = require('../../models');
const { Op } = require('sequelize');
const { checkPermission } = require('../../shared/constants/permissions');

class WorkspaceCollectionsService {

  async getMember(userId, workspaceId) {
    return await WorkspaceMember.findOne({
      where: { workspaceId, userId }
    });
  }

  async getWorkspaceCollections(userId, workspaceId) {
    const member = await this.getMember(userId, workspaceId);
    checkPermission('VIEW_COLLECTIONS', member);

    const collections = await Collection.findAll({
      where: { workspaceId },
      order: [['createdAt', 'ASC']]
    });

    return collections;
  }

  async getWorkspaceCollectionById(userId, workspaceId, collectionId) {
    const member = await this.getMember(userId, workspaceId);
    checkPermission('VIEW_COLLECTIONS', member);

    const collection = await Collection.findOne({
      where: { id: collectionId, workspaceId }
    });

    if (!collection) {
      throw new Error('Kolekcja nie znaleziona w tym workspace');
    }

    const itemCount = await Item.count({
      where: { collectionId, status: 'active' }
    });

    return {
      ...collection.toJSON(),
      itemCount
    };
  }

  async getCollectionItems(userId, workspaceId, collectionId) {
    const member = await this.getMember(userId, workspaceId);
    checkPermission('VIEW_REFERENCES', member);

    const collection = await Collection.findOne({
      where: { id: collectionId, workspaceId }
    });

    if (!collection) {
      throw new Error('Kolekcja nie znaleziona w tym workspace');
    }

    const items = await Item.findAll({
      where: { collectionId, status: 'active' },
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

  async createWorkspaceCollection(userId, workspaceId, data) {
    const { name, settings } = data;

    const member = await this.getMember(userId, workspaceId);
    checkPermission('CREATE_COLLECTION', member);

    if (!name) {
      throw new Error('Nazwa kolekcji jest wymagana');
    }

    const existing = await Collection.findOne({
      where: { workspaceId, name }
    });

    if (existing) {
      throw new Error('Kolekcja o tej nazwie już istnieje w workspace');
    }

    const collection = await Collection.create({
      name,
      ownerId: null,
      workspaceId,
      isSystemDefault: false,
      isPublic: true,
      settings: settings || { color: '#3B82F6' }
    });

    return collection;
  }

  async updateWorkspaceCollection(userId, workspaceId, collectionId, data) {
    const member = await this.getMember(userId, workspaceId);
    checkPermission('UPDATE_COLLECTION', member);

    const collection = await Collection.findOne({
      where: { id: collectionId, workspaceId }
    });

    if (!collection) {
      throw new Error('Kolekcja nie znaleziona');
    }

    const { name, settings } = data;

    if (name && name !== collection.name) {
      const existing = await Collection.findOne({
        where: {
          workspaceId,
          name,
          id: { [Op.ne]: collectionId }
        }
      });

      if (existing) {
        throw new Error('Kolekcja o tej nazwie już istnieje');
      }
    }

    await collection.update({
      ...(name && { name }),
      ...(settings && { settings })
    });

    return collection;
  }

  async deleteWorkspaceCollection(userId, workspaceId, collectionId) {
    const member = await this.getMember(userId, workspaceId);
    checkPermission('DELETE_COLLECTION', member);

    const collection = await Collection.findOne({
      where: { id: collectionId, workspaceId }
    });

    if (!collection) {
      throw new Error('Kolekcja nie znaleziona');
    }

    const itemCount = await Item.count({
      where: { collectionId, status: 'active' }
    });

    if (itemCount > 0) {
      throw new Error(`Nie można usunąć kolekcji - zawiera ${itemCount} elementów`);
    }

    await collection.destroy();

    return { message: 'Kolekcja usunięta' };
  }
}

module.exports = new WorkspaceCollectionsService();