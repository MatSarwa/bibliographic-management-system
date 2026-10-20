const { Comment, Item, User, WorkspaceMember, Collection } = require('../../models');
const { checkPermission, hasPermission } = require('../../shared/constants/permissions');
const AppError = require('../../shared/utils/app-error');

class CommentsService {

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

  async addComment(userId, itemId, data) {
    const { content, parentId } = data;

    if (!content) {
      throw new AppError('Treść komentarza jest wymagana', 400);
    }

    const item = await Item.findByPk(itemId, {
      include: [
        {
          model: Collection,
          as: 'collection',
          attributes: ['id', 'name', 'workspaceId']
        }
      ]
    });

    if (!item) {
      throw new AppError('Nie znaleziono pozycji', 404);
    }

    if (!item.collection || !item.collection.workspaceId) {
      throw new AppError('Komentarze są dostępne tylko dla pozycji w workspace', 400);
    }

    const member = await this.getMemberForItem(userId, item);
    checkPermission('CREATE_COMMENT', member);

    if (parentId) {
      const parentComment = await Comment.findByPk(parentId);
      if (!parentComment || parentComment.itemId !== itemId) {
        throw new AppError('Parent comment nie znaleziony', 404);
      }
    }

    const comment = await Comment.create({
      itemId,
      userId,
      content,
      parentId: parentId || null,
      isResolved: false
    });

    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    return commentWithUser;
  }

  async getComments(userId, itemId) {
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

    if (item.collection && item.collection.workspaceId) {
      const member = await this.getMemberForItem(userId, item);
      checkPermission('VIEW_COMMENTS', member);
    } else {
      if (item.userId !== userId) {
        throw new AppError('Brak dostępu do tej pozycji', 403);
      }
    }

    const comments = await Comment.findAll({
      where: { itemId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    const commentsMap = {};
    const rootComments = [];

    comments.forEach(comment => {
      commentsMap[comment.id] = {
        ...comment.toJSON(),
        replies: []
      };
    });

    comments.forEach(comment => {
      if (comment.parentId && commentsMap[comment.parentId]) {
        commentsMap[comment.parentId].replies.push(commentsMap[comment.id]);
      } else if (!comment.parentId) {
        rootComments.push(commentsMap[comment.id]);
      }
    });

    return rootComments;
  }

  async updateComment(userId, commentId, data) {
    const { content } = data;

    if (!content) {
      throw new AppError('Treść komentarza jest wymagana', 400);
    }

    const comment = await Comment.findByPk(commentId, {
      include: [
        {
          model: Item,
          as: 'item',
          include: [
            {
              model: Collection,
              as: 'collection',
              attributes: ['workspaceId']
            }
          ]
        }
      ]
    });

    if (!comment) {
      throw new AppError('Komentarz nie znaleziony', 404);
    }

    const canEdit = await this.canModifyComment(userId, comment);
    if (!canEdit) {
      throw new AppError('Brak uprawnień do edycji komentarza', 403);
    }

    await comment.update({ content });

    const updatedComment = await Comment.findByPk(commentId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    return updatedComment;
  }

  async deleteComment(userId, commentId) {
    const comment = await Comment.findByPk(commentId, {
      include: [
        {
          model: Item,
          as: 'item',
          include: [
            {
              model: Collection,
              as: 'collection',
              attributes: ['workspaceId']
            }
          ]
        }
      ]
    });

    if (!comment) {
      throw new AppError('Komentarz nie znaleziony', 404);
    }

    const canDelete = await this.canModifyComment(userId, comment);
    if (!canDelete) {
      throw new AppError('Brak uprawnień do usunięcia komentarza', 403);
    }

    await comment.destroy();

    return { message: 'Komentarz usunięty' };
  }

  async resolveComment(userId, commentId) {
    const comment = await Comment.findByPk(commentId, {
      include: [
        {
          model: Item,
          as: 'item',
          include: [
            {
              model: Collection,
              as: 'collection',
              attributes: ['workspaceId']
            }
          ]
        }
      ]
    });

    if (!comment) {
      throw new AppError('Komentarz nie znaleziony', 404);
    }

    const workspaceId = comment.item.collection?.workspaceId;
    if (!workspaceId) {
      throw new AppError('Rozwiązywanie komentarzy działa tylko dla pozycji w workspace', 400);
    }

    const member = await WorkspaceMember.findOne({
      where: { workspaceId, userId }
    });

    checkPermission('RESOLVE_COMMENT', member);

    await comment.update({ isResolved: !comment.isResolved });

    return comment;
  }

  async canModifyComment(userId, comment) {
    const workspaceId = comment.item.collection?.workspaceId;
    
    if (!workspaceId) {
      return false;
    }

    const member = await WorkspaceMember.findOne({
      where: { workspaceId, userId }
    });

    if (!member) {
      return false;
    }

    if (comment.userId === userId) {
      return hasPermission('UPDATE_OWN_COMMENT', member.role);
    }
    return hasPermission('UPDATE_ANY_COMMENT', member.role);
  }
}

module.exports = new CommentsService();