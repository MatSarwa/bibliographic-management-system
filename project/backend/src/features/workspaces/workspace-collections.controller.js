const asyncHandler = require('../../shared/utils/async-handler');
const workspaceCollectionsService = require('./workspace-collections.service');
const ResponseHelper = require('../../shared/utils/response.helper');

class WorkspaceCollectionsController {

  getWorkspaceCollections = asyncHandler(async (req, res) => {
    const { workspaceId } = req.params;

    const collections = await workspaceCollectionsService.getWorkspaceCollections(
      req.user.id,
      workspaceId
    );

    ResponseHelper.success(res, collections);
  });

  getWorkspaceCollectionById = asyncHandler(async (req, res) => {
    const { workspaceId, collectionId } = req.params;

    const collection = await workspaceCollectionsService.getWorkspaceCollectionById(
      req.user.id,
      workspaceId,
      collectionId
    );

    ResponseHelper.success(res, collection);
  });

  getCollectionItems = asyncHandler(async (req, res) => {
    const { workspaceId, collectionId } = req.params;

    const items = await workspaceCollectionsService.getCollectionItems(
      req.user.id,
      workspaceId,
      collectionId
    );

    ResponseHelper.success(res, items);
  });

  createWorkspaceCollection = asyncHandler(async (req, res) => {
    const { workspaceId } = req.params;

    const collection = await workspaceCollectionsService.createWorkspaceCollection(
      req.user.id,
      workspaceId,
      req.body
    );

    console.log('Workspace collection utworzona');

    ResponseHelper.created(res, collection, 'Kolekcja utworzona pomyślnie');
  });

  updateWorkspaceCollection = asyncHandler(async (req, res) => {
    const { workspaceId, collectionId } = req.params;

    const collection = await workspaceCollectionsService.updateWorkspaceCollection(
      req.user.id,
      workspaceId,
      collectionId,
      req.body
    );

    console.log('Workspace collection zaktualizowana');

    ResponseHelper.success(res, collection, 'Kolekcja zaktualizowana pomyślnie');
  });

  deleteWorkspaceCollection = asyncHandler(async (req, res) => {
    const { workspaceId, collectionId } = req.params;

    const result = await workspaceCollectionsService.deleteWorkspaceCollection(
      req.user.id,
      workspaceId,
      collectionId
    );

    console.log('Workspace collection usunięta');

    ResponseHelper.success(res, result, result.message);
  });
}

module.exports = new WorkspaceCollectionsController();