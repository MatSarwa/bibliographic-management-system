const asyncHandler = require('../../shared/utils/async-handler');
const collectionsService = require('./collections.service');
const ResponseHelper = require('../../shared/utils/response.helper');

class CollectionsController {
  createCollection = asyncHandler(async (req, res) => {
    const { name, parentId, settings } = req.body;

    if (!name) {
      return ResponseHelper.error(res, 'Nazwa kolekcji jest wymagana', 400);
    }

    const collection = await collectionsService.createCollection(req.user.id, {
      name,
      parentId,
      settings
    });


    ResponseHelper.created(res, collection, 'Kolekcja utworzona pomyślnie');
  });

  getAllCollections = asyncHandler(async (req, res) => {
    const collections = await collectionsService.getAllCollections(req.user.id);

    ResponseHelper.success(res, collections);
  });

  getCollectionTree = asyncHandler(async (req, res) => {
    const tree = await collectionsService.getCollectionTree(req.user.id);

    ResponseHelper.success(res, tree);
  });

  getCollectionById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const collection = await collectionsService.getCollectionById(req.user.id, id);

    ResponseHelper.success(res, collection);
  });

  updateCollection = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, parentId, settings, isPublic } = req.body;

    const collection = await collectionsService.updateCollection(req.user.id, id, {
      name,
      parentId,
      settings,
      isPublic
    });


    ResponseHelper.success(res, collection, 'Kolekcja zaktualizowana pomyślnie');
  });

  deleteCollection = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await collectionsService.deleteCollection(req.user.id, id);


    ResponseHelper.success(res, null, result.message);
  });

restoreCollection = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await collectionsService.restoreCollection(req.user.id, id);


  ResponseHelper.success(res, null, result.message);
});


getCollectionItems = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const items = await collectionsService.getCollectionItems(req.user.id, id);

  ResponseHelper.success(res, items);
});


}

module.exports = new CollectionsController();