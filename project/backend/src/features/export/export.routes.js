const express = require('express');
const router = express.Router();
const exportController = require('./export.controller');
const authenticateToken = require('../auth/auth.middleware');
const {heavyOperationLimiter} = require('../../shared/middleware/rate-limit.middleware');

router.use(authenticateToken);

router.get('/items/:itemId', heavyOperationLimiter, exportController.exportItem);
router.post('/items', heavyOperationLimiter, exportController.exportMultipleItems);
router.get('/collections/:collectionId', heavyOperationLimiter, exportController.exportCollection);

module.exports = router;