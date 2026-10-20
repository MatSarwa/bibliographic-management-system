const asyncHandler = require('../../shared/utils/async-handler');
const commentsService = require('./comments.service');
const ResponseHelper = require('../../shared/utils/response.helper');

class CommentsController {

  addComment = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { content, parentId } = req.body;

    if (!content) {
      return ResponseHelper.error(res, 'Treść komentarza jest wymagana', 400);
    }

    const comment = await commentsService.addComment(req.user.id, itemId, {
      content,
      parentId
    });


    ResponseHelper.created(res, comment, 'Komentarz dodany pomyślnie');
  });

  getComments = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    const comments = await commentsService.getComments(req.user.id, itemId);

    ResponseHelper.success(res, comments);
  });

  updateComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return ResponseHelper.error(res, 'Treść komentarza jest wymagana', 400);
    }

    const comment = await commentsService.updateComment(req.user.id, id, { content });


    ResponseHelper.success(res, comment, 'Komentarz zaktualizowany pomyślnie');
  });

  deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await commentsService.deleteComment(req.user.id, id);


    ResponseHelper.success(res, null, result.message);
  });

  resolveComment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const comment = await commentsService.resolveComment(req.user.id, id);


    ResponseHelper.success(res, comment, 'Status komentarza zmieniony');
  });
}

module.exports = new CommentsController();