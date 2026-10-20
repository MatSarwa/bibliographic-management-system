const asyncHandler = require('../../shared/utils/async-handler');
const exportService = require('./export.service');
const ResponseHelper = require('../../shared/utils/response.helper');

class ExportController {

  exportItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { format } = req.query; 

    if (!format || !['bibtex', 'ris'].includes(format)) {
      return ResponseHelper.error(res, 'Format musi być "bibtex" lub "ris"', 400);
    }

    const content = await exportService.exportItem(req.user.id, itemId, format);


    const extension = format === 'bibtex' ? 'bib' : 'ris';
    const filename = `item_${itemId.substring(0, 8)}.${extension}`;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  });

  exportMultipleItems = asyncHandler(async (req, res) => {
    const { itemIds } = req.body;
    const { format } = req.query; 

    if (!format || !['bibtex', 'ris'].includes(format)) {
      return ResponseHelper.error(res, 'Format musi być "bibtex" lub "ris"', 400);
    }

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return ResponseHelper.error(res, 'itemIds musi być niepustą tablicą', 400);
    }

    const content = await exportService.exportMultipleItems(req.user.id, itemIds, format);


    const extension = format === 'bibtex' ? 'bib' : 'ris';
    const filename = `bibliography.${extension}`;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  });

  exportCollection = asyncHandler(async (req, res) => {
    const { collectionId } = req.params;
    const { format } = req.query; 

    if (!format || !['bibtex', 'ris'].includes(format)) {
      return ResponseHelper.error(res, 'Format musi być "bibtex" lub "ris"', 400);
    }

    const content = await exportService.exportCollection(req.user.id, collectionId, format);


    const extension = format === 'bibtex' ? 'bib' : 'ris';
    const filename = `collection_${collectionId.substring(0, 8)}.${extension}`;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  });
}

module.exports = new ExportController();