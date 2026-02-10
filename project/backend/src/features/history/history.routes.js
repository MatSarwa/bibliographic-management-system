const express = require('express');
const router = express.Router();
const historyController = require('./history.controller');
const authenticateToken = require('../auth/auth.middleware');

router.use(authenticateToken);

router.get('/items/:itemId', historyController.getHistory);
router.get('/items/:itemId/:version', historyController.getVersion);
router.post('/items/:itemId/restore/:version', historyController.restoreVersion);

module.exports = router;