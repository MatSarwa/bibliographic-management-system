const { Comment, Item, User, WorkspaceMember, Collection } = require('../../models');
const { checkPermission, hasPermission } = require('../../shared/constants/permissions');

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
      throw new Error('Treść komentarza jest wymagana');
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
      throw new Error('Item nie znaleziony');
    }

    if (!item.collection || !item.collection.workspaceId) {
      throw new Error('Komentarze dostępne tylko dla workspace items');
    }

    const member = await this.getMemberForItem(userId, item);
    checkPermission('CREATE_COMMENT', member);

    if (parentId) {
      const parentComment = await Comment.findByPk(parentId);
      if (!parentComment || parentComment.itemId !== itemId) {
        throw new Error('Parent comment nie znaleziony');
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
      throw new Error('Item nie znaleziony');
    }

    if (item.collection && item.collection.workspaceId) {
      const member = await this.getMemberForItem(userId, item);
      checkPermission('VIEW_COMMENTS', member);
    } else {
      if (item.userId !== userId) {
        throw new Error('Brak dostępu do itemu');
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
      throw new Error('Treść komentarza jest wymagana');
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
      throw new Error('Komentarz nie znaleziony');
    }

    const canEdit = await this.canModifyComment(userId, comment);
    if (!canEdit) {
      throw new Error('Brak uprawnień do edycji komentarza');
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
      throw new Error('Komentarz nie znaleziony');
    }

    const canDelete = await this.canModifyComment(userId, comment);
    if (!canDelete) {
      throw new Error('Brak uprawnień do usunięcia komentarza');
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
      throw new Error('Komentarz nie znaleziony');
    }

    const workspaceId = comment.item.collection?.workspaceId;
    if (!workspaceId) {
      throw new Error('Resolve dostępne tylko dla workspace items');
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