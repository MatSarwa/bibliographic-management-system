const { Collection, CollectionMember, User } = require('../../models');
const { Op } = require('sequelize');

class CollectionSharingService {

  async shareCollection(ownerId, collectionId, userData) {
    const { email, username } = userData;

    if (!email && !username) {
      throw new Error('Email lub username jest wymagany');
    }

    const collection = await Collection.findOne({
      where: {
        id: collectionId,
        ownerId
      }
    });

    if (!collection) {
      throw new Error('Kolekcja nie znaleziona lub brak uprawnień');
    }

    if (collection.isSystemDefault) {
      throw new Error('Nie można sharować domyślnej kolekcji');
    }

    const subfolderCount = await Collection.count({
      where: {
        parentId: collectionId
      }
    });

    if (subfolderCount > 0) {
      throw new Error(`Nie można sharować folderu który ma ${subfolderCount} podfolderów. Sharuj tylko foldery bez zagnieżdżenia.`);
    }

    const whereConditions = [];
    
    if (email) {
      whereConditions.push({ email });
    }
    
    if (username) {
      whereConditions.push({ username });
    }

    const userToShare = await User.findOne({
      where: {
        [Op.or]: whereConditions
      }
    });

    if (!userToShare) {
      const identifier = email || username;
      throw new Error(`User "${identifier}" nie istnieje`);
    }

    if (userToShare.id === ownerId) {
      throw new Error('Nie możesz sharować kolekcji z samym sobą');
    }

    const existing = await CollectionMember.findOne({
      where: {
        collectionId,
        userId: userToShare.id
      }
    });

    if (existing) {
      throw new Error('Kolekcja jest już shared z tym userem');
    }

    const member = await CollectionMember.create({
      collectionId,
      userId: userToShare.id
    });

    const memberWithUser = await CollectionMember.findByPk(member.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    return memberWithUser;
  }

  async unshareCollection(ownerId, collectionId, userIdToRemove) {

    const collection = await Collection.findOne({
      where: {
        id: collectionId,
        ownerId
      }
    });

    if (!collection) {
      throw new Error('Kolekcja nie znaleziona lub brak uprawnień');
    }

    const deleted = await CollectionMember.destroy({
      where: {
        collectionId,
        userId: userIdToRemove
      }
    });

    if (deleted === 0) {
      throw new Error('Kolekcja nie była shared z tym userem');
    }

    return { message: 'Sharing usunięty' };
  }

  async getSharedUsers(userId, collectionId) {

    const hasAccess = await this.checkAccess(userId, collectionId);

    if (!hasAccess) {
      throw new Error('Brak dostępu do tej kolekcji');
    }

    const collection = await Collection.findByPk(collectionId, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    const sharedWith = await CollectionMember.findAll({
      where: { collectionId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['joinedAt', 'DESC']]
    });

    return {
      owner: collection.owner,
      sharedWith
    };
  }

  async getSharedWithMe(userId) {

    const sharedCollections = await CollectionMember.findAll({
      where: { userId },
      include: [
        {
          model: Collection,
          as: 'collection',
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['id', 'username', 'email']
            }
          ]
        }
      ],
      order: [['joinedAt', 'DESC']]
    });

    return sharedCollections.map(sc => ({
      collection: sc.collection,
      sharedBy: sc.collection.owner,
      sharedAt: sc.joinedAt
    }));
  }

  async checkAccess(userId, collectionId) {

    const collection = await Collection.findOne({
      where: {
        id: collectionId,
        ownerId: userId
      }
    });

    if (collection) {
      return true;
    }

    const member = await CollectionMember.findOne({
      where: {
        collectionId,
        userId
      }
    });

    return !!member;
  }

  async leaveSharedCollection(userId, collectionId) {

    const collection = await Collection.findByPk(collectionId);

    if (!collection) {
      throw new Error('Kolekcja nie znaleziona');
    }

    if (collection.ownerId === userId) {
      throw new Error('Owner nie może opuścić swojej kolekcji. Usuń sharing zamiast tego.');
    }

    const deleted = await CollectionMember.destroy({
      where: {
        collectionId,
        userId
      }
    });

    if (deleted === 0) {
      throw new Error('Kolekcja nie była shared z tobą');
    }

    return { message: 'Opuściłeś shared kolekcję' };
  }
}

module.exports = new CollectionSharingService();