const { Collection, CollectionMember, User } = require('../../models');
const { Op } = require('sequelize');
const AppError = require('../../shared/utils/app-error');

class CollectionSharingService {

  async shareCollection(ownerId, collectionId, userData) {
    const { email, username } = userData;

    if (!email && !username) {
      throw new AppError('Email lub username jest wymagany', 400);
    }

    const collection = await Collection.findOne({
      where: {
        id: collectionId,
        ownerId
      }
    });

    if (!collection) {
      throw new AppError('Kolekcja nie znaleziona lub brak uprawnień', 404);
    }

    if (collection.isSystemDefault) {
      throw new AppError('Nie można sharować domyślnej kolekcji', 400);
    }

    const subfolderCount = await Collection.count({
      where: {
        parentId: collectionId
      }
    });

    if (subfolderCount > 0) {
      throw new AppError(`Nie można sharować folderu który ma ${subfolderCount} podfolderów. Sharuj tylko foldery bez zagnieżdżenia.`, 400);
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
      throw new AppError(`User "${identifier}" nie istnieje`, 404);
    }

    if (userToShare.id === ownerId) {
      throw new AppError('Nie możesz sharować kolekcji z samym sobą', 400);
    }

    const existing = await CollectionMember.findOne({
      where: {
        collectionId,
        userId: userToShare.id
      }
    });

    if (existing) {
      throw new AppError('Kolekcja jest już shared z tym userem', 409);
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
      throw new AppError('Kolekcja nie znaleziona lub brak uprawnień', 404);
    }

    const deleted = await CollectionMember.destroy({
      where: {
        collectionId,
        userId: userIdToRemove
      }
    });

    if (deleted === 0) {
      throw new AppError('Kolekcja nie była shared z tym userem', 404);
    }

    return { message: 'Sharing usunięty' };
  }

  async getSharedUsers(userId, collectionId) {

    const hasAccess = await this.checkAccess(userId, collectionId);

    if (!hasAccess) {
      throw new AppError('Brak dostępu do tej kolekcji', 403);
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
      throw new AppError('Kolekcja nie znaleziona', 404);
    }

    if (collection.ownerId === userId) {
      throw new AppError('Owner nie może opuścić swojej kolekcji. Usuń sharing zamiast tego.', 400);
    }

    const deleted = await CollectionMember.destroy({
      where: {
        collectionId,
        userId
      }
    });

    if (deleted === 0) {
      throw new AppError('Kolekcja nie była shared z tobą', 404);
    }

    return { message: 'Opuściłeś shared kolekcję' };
  }
}

module.exports = new CollectionSharingService();