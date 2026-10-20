const asyncHandler = require('../../shared/utils/async-handler');
const labelsService = require('./labels.service');
const ResponseHelper = require('../../shared/utils/response.helper');

class LabelsController {
  createLabel = asyncHandler(async (req, res) => {
    const { name, color } = req.body;

    if (!name) {
      return ResponseHelper.error(res, 'Nazwa labela jest wymagana', 400);
    }

    const label = await labelsService.createLabel(req.user.id, { name, color });


    ResponseHelper.created(res, label, 'Label utworzony pomyślnie');
  });

  getAllLabels = asyncHandler(async (req, res) => {
    const labels = await labelsService.getAllLabels(req.user.id);

    ResponseHelper.success(res, labels);
  });

  getLabelById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const label = await labelsService.getLabelById(req.user.id, id);

    ResponseHelper.success(res, label);
  });

  updateLabel = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, color } = req.body;

    if (!name && !color) {
      return ResponseHelper.error(res, 'Podaj nazwę lub kolor do aktualizacji', 400);
    }

    const label = await labelsService.updateLabel(req.user.id, id, { name, color });


    ResponseHelper.success(res, label, 'Label zaktualizowany pomyślnie');
  });

  deleteLabel = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await labelsService.deleteLabel(req.user.id, id);


    ResponseHelper.success(res, null, result.message);
  });

  getLabelStats = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const stats = await labelsService.getLabelStats(req.user.id, id);

    ResponseHelper.success(res, stats);
  });
}

module.exports = new LabelsController();