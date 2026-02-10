const express = require('express');
const router = express.Router();
const itemLabelsController = require('./item-labels.controller');
const authenticateToken = require('../auth/auth.middleware');

router.use(authenticateToken);

router.post('/:itemId/labels/:labelId', itemLabelsController.addLabelToItem);
router.delete('/:itemId/labels/:labelId', itemLabelsController.removeLabelFromItem);
router.get('/:itemId/labels', itemLabelsController.getItemLabels);
router.put('/:itemId/labels', itemLabelsController.setItemLabels);

router.get('/by-label/:labelId', itemLabelsController.getItemsByLabel);

module.exports = router;