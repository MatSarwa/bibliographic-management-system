const asyncHandler = require('../../shared/utils/async-handler');
const itemLabelsService = require('./item-labels.service');
const ResponseHelper = require('../../shared/utils/response.helper');

class ItemLabelsController {
  addLabelToItem = asyncHandler(async (req, res) => {
    const { itemId, labelId } = req.params;

    const item = await itemLabelsService.addLabelToItem(req.user.id, itemId, labelId);

    console.log('Label dodany do itemu:', item.title);

    ResponseHelper.success(res, item, 'Label dodany pomyślnie');
  });

  removeLabelFromItem = asyncHandler(async (req, res) => {
    const { itemId, labelId } = req.params;

    const item = await itemLabelsService.removeLabelFromItem(req.user.id, itemId, labelId);

    console.log('Label usunięty z itemu:', item.title);

    ResponseHelper.success(res, item, 'Label usunięty pomyślnie');
  });

  getItemsByLabel = asyncHandler(async (req, res) => {
    const { labelId } = req.params;

    const items = await itemLabelsService.getItemsByLabel(req.user.id, labelId);

    ResponseHelper.success(res, items);
  });

  getItemLabels = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    const labels = await itemLabelsService.getItemLabels(req.user.id, itemId);

    ResponseHelper.success(res, labels);
  });

  setItemLabels = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { labelIds } = req.body;

    if (!Array.isArray(labelIds)) {
      return ResponseHelper.error(res, 'labelIds musi być tablicą', 400);
    }

    const item = await itemLabelsService.setItemLabels(req.user.id, itemId, labelIds);

    console.log('Labels zaktualizowane dla itemu:', item.title);

    ResponseHelper.success(res, item, 'Labels zaktualizowane pomyślnie');
  });
}

module.exports = new ItemLabelsController();