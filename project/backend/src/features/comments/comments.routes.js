const express = require('express');
const router = express.Router();
const commentsController = require('./comments.controller');
const authenticateToken = require('../auth/auth.middleware');

router.use(authenticateToken);

router.post('/items/:itemId/comments', commentsController.addComment);
router.get('/items/:itemId/comments', commentsController.getComments);

router.put('/:id', commentsController.updateComment);
router.delete('/:id', commentsController.deleteComment);
router.post('/:id/resolve', commentsController.resolveComment);

module.exports = router;