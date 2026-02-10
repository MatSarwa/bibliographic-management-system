const express = require('express');
const router = express.Router();
const collectionsController = require('./collections.controller');
const authenticateToken = require('../auth/auth.middleware');

router.use(authenticateToken);

router.post('/', collectionsController.createCollection);
router.get('/', collectionsController.getAllCollections);
router.get('/tree', collectionsController.getCollectionTree);
router.get('/:id', collectionsController.getCollectionById);
router.put('/:id', collectionsController.updateCollection);
router.delete('/:id', collectionsController.deleteCollection);
router.post('/:id/restore', collectionsController.restoreCollection);
router.get('/:id/items', collectionsController.getCollectionItems);

module.exports = router;