const express = require('express');
const router = express.Router();
const collectionSharingController = require('./collection-sharing.controller');
const authenticateToken = require('../auth/auth.middleware');

router.use(authenticateToken);

router.get('/shared-with-me', collectionSharingController.getSharedWithMe);

router.post('/:collectionId/share', collectionSharingController.shareCollection);
router.delete('/:collectionId/share/:userId', collectionSharingController.unshareCollection);
router.get('/:collectionId/shared-users', collectionSharingController.getSharedUsers);

router.delete('/:collectionId/leave', collectionSharingController.leaveSharedCollection);

module.exports = router;