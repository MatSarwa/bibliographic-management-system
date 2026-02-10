const express = require('express');
const router = express.Router();
const labelsController = require('./labels.controller');
const authenticateToken = require('../auth/auth.middleware');

router.use(authenticateToken);

router.post('/', labelsController.createLabel);
router.get('/', labelsController.getAllLabels);
router.get('/:id', labelsController.getLabelById);
router.get('/:id/stats', labelsController.getLabelStats);
router.put('/:id', labelsController.updateLabel);
router.delete('/:id', labelsController.deleteLabel);

module.exports = router;