const asyncHandler = require('../../shared/utils/async-handler');
const itemsService = require('./items.service');
const ResponseHelper = require('../../shared/utils/response.helper');

class ItemsController {
  createItem = asyncHandler(async (req, res) => {
    const {
      title,
      itemType,
      metadata,
      year,
      notes,
      favorite,
      collectionId
    } = req.body;

    if (!title) {
      return ResponseHelper.error(res, 'Tytuł jest wymagany', 400);
    }

    const item = await itemsService.createItem(req.user.id, {
      title,
      itemType,
      metadata,
      year,
      notes,
      favorite,
      collectionId
    });


    ResponseHelper.created(res, item, 'Dodano pozycję');
  });

  getAllItems = asyncHandler(async (req, res) => {
    const { favorite, itemType, year, search } = req.query;

    const items = await itemsService.getAllItems(req.user.id, {
      favorite,
      itemType,
      year,
      search
    });

    ResponseHelper.success(res, items);
  });

  getFavorites = asyncHandler(async (req, res) => {
    const items = await itemsService.getFavorites(req.user.id);

    ResponseHelper.success(res, items);
  });

  getTrash = asyncHandler(async (req, res) => {
    const items = await itemsService.getTrash(req.user.id);

    ResponseHelper.success(res, items);
  });

  emptyTrash = asyncHandler(async (req, res) => {
    const deleted = await itemsService.emptyTrash(req.user.id);

    ResponseHelper.success(res, { deleted }, 'Kosz opróżniony');
  });

  getItemById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const item = await itemsService.getItemById(req.user.id, id);

    ResponseHelper.success(res, item);
  });

  updateItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      title,
      itemType,
      metadata,
      year,
      notes,
      favorite,
      collectionId
    } = req.body;

    const item = await itemsService.updateItem(req.user.id, id, {
      title,
      itemType,
      metadata,
      year,
      notes,
      favorite,
      collectionId
    });


    ResponseHelper.success(res, item, 'Zapisano zmiany');
  });

  moveToTrash = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await itemsService.moveToTrash(req.user.id, id);


    ResponseHelper.success(res, null, result.message);
  });

  restoreItem = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await itemsService.restoreItem(req.user.id, id);


    ResponseHelper.success(res, null, result.message);
  });

  permanentDelete = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await itemsService.permanentDelete(req.user.id, id);


    ResponseHelper.success(res, null, result.message);
  });

  toggleFavorite = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const item = await itemsService.toggleFavorite(req.user.id, id);


    ResponseHelper.success(res, item, 'Status ulubionego zmieniony');
  });

restoreItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await itemsService.restoreItem(req.user.id, id);


  ResponseHelper.success(res, null, result.message);
});

}

module.exports = new ItemsController();