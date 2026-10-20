const express = require('express');
const router = express.Router();
const workspaceController = require('./workspace.controller');
const workspaceCollectionsController = require('./workspace-collections.controller');
const authenticateToken = require('../auth/auth.middleware');

router.use(authenticateToken);

router.post('/', workspaceController.createWorkspace);
router.get('/', workspaceController.getAllWorkspaces);

router.get('/:workspaceId/collections', workspaceCollectionsController.getWorkspaceCollections);
router.get('/:workspaceId/trash', workspaceCollectionsController.getWorkspaceTrash);
router.post('/:workspaceId/collections', workspaceCollectionsController.createWorkspaceCollection);
router.get('/:workspaceId/collections/:collectionId', workspaceCollectionsController.getWorkspaceCollectionById);
router.put('/:workspaceId/collections/:collectionId', workspaceCollectionsController.updateWorkspaceCollection);
router.delete('/:workspaceId/collections/:collectionId', workspaceCollectionsController.deleteWorkspaceCollection);

router.get('/:workspaceId/collections/:collectionId/items', workspaceCollectionsController.getCollectionItems);

router.get('/:id', workspaceController.getWorkspaceById);
router.put('/:id', workspaceController.updateWorkspace);
router.delete('/:id', workspaceController.deleteWorkspace);

router.post('/:id/transfer-ownership', workspaceController.transferOwnership);

router.post('/:id/members', workspaceController.addMember);
router.get('/:id/members', workspaceController.getWorkspaceMembers);
router.put('/:id/members/:userId/role', workspaceController.updateMemberRole);
router.delete('/:id/members/:userId', workspaceController.removeMember);

router.post('/:id/leave', workspaceController.leaveWorkspace);

module.exports = router;