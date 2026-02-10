const express = require('express');
const router = express.Router();
const itemsController = require('./items.controller');
const authenticateToken = require('../auth/auth.middleware');

router.use(authenticateToken);

router.post('/', itemsController.createItem);
router.get('/', itemsController.getAllItems);
router.get('/favorites', itemsController.getFavorites);
router.get('/trash', itemsController.getTrash);
router.get('/:id', itemsController.getItemById);
router.put('/:id', itemsController.updateItem);
router.delete('/:id', itemsController.moveToTrash);

router.put('/:id/restore', itemsController.restoreItem);
router.delete('/:id/permanent', itemsController.permanentDelete);
router.patch('/:id/favorite', itemsController.toggleFavorite);
router.post('/:id/restore', itemsController.restoreItem);

module.exports = router;