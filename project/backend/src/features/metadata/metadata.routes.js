const express = require('express');
const router = express.Router();
const metadataController = require('./metadata.controller');
const authenticateToken = require('../auth/auth.middleware');
const {externalApiLimiter } = require('../../shared/middleware/rate-limit.middleware');


router.use(authenticateToken);

router.post('/fetch', externalApiLimiter , metadataController.fetch);
router.get('/search', externalApiLimiter , metadataController.search);

router.get('/cache/stats', authenticateToken, metadataController.getCacheStats);
router.delete('/cache', authenticateToken, metadataController.clearCache);

module.exports = router;