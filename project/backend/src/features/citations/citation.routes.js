const express = require('express');
const router = express.Router();
const citationController = require('./citation.controller');
const authenticateToken = require('../auth/auth.middleware');
const {heavyOperationLimiter} = require('../../shared/middleware/rate-limit.middleware');

router.use(authenticateToken);

router.get('/styles', citationController.getStyles);
router.get('/item/:itemId', heavyOperationLimiter, citationController.generateCitation);

module.exports = router;