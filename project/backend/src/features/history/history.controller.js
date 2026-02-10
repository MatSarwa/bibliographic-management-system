const asyncHandler = require('../../shared/utils/async-handler');
const historyService = require('./history.service');
const ResponseHelper = require('../../shared/utils/response.helper');

class HistoryController {

  getHistory = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    const history = await historyService.getHistory(req.user.id, itemId);

    ResponseHelper.success(res, history);
  });

  getVersion = asyncHandler(async (req, res) => {
    const { itemId, version } = req.params;

    const historyVersion = await historyService.getVersion(
      req.user.id,
      itemId,
      parseInt(version)
    );

    ResponseHelper.success(res, historyVersion);
  });

  restoreVersion = asyncHandler(async (req, res) => {
    const { itemId, version } = req.params;

    const result = await historyService.restoreVersion(
      req.user.id,
      itemId,
      parseInt(version)
    );

    console.log('Item przywrócony do wersji:', version);

    ResponseHelper.success(res, result, result.message);
  });
}

module.exports = new HistoryController();