const asyncHandler = require('../../shared/utils/async-handler');
const citationService = require('./citation.service');
const ResponseHelper = require('../../shared/utils/response.helper');
const { Item } = require('../../models');

class CitationController {
  
  getStyles = asyncHandler(async (req, res) => {
    const styles = citationService.getStyles();
    ResponseHelper.success(res, styles);
  });

  generateCitation = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { style = 'apa' } = req.query;

    const item = await Item.findOne({
      where: {
        id: itemId,
        userId: req.user.id,
        status: 'active'
      }
    });

    if (!item) {
      return ResponseHelper.error(res, 'Nie znaleziono pozycji', 404);
    }

    try {
      const citation = citationService.generateCitation(item, style);

      ResponseHelper.success(res, {
        citation,
        style,
        itemId
      });
    } catch (err) {
      return ResponseHelper.error(res, err.message, 400);
    }
  });
}

module.exports = new CitationController();