const asyncHandler = require('../../shared/utils/async-handler');
const metadataService = require('./metadata.service');
const ResponseHelper = require('../../shared/utils/response.helper');

class MetadataController {
  fetch = asyncHandler(async (req, res) => {
    const { identifier } = req.body;

    if (!identifier) {
      return ResponseHelper.error(res, 'Identifier jest wymagany', 400);
    }

    const metadata = await metadataService.fetch(identifier);

    console.log('Metadata pobrane:', identifier);

    ResponseHelper.success(res, metadata);
  });

  search = asyncHandler(async (req, res) => {
    const { q, limit } = req.query;

    if (!q) {
      return ResponseHelper.error(res, 'Query parameter "q" jest wymagany', 400);
    }

    const results = await metadataService.search(q, {
      limit: parseInt(limit) || 20
    });

    ResponseHelper.success(res, {
      query: q,
      count: results.length,
      results
    });
  });

  getCacheStats = asyncHandler(async (req, res) => {
    const stats = metadataService.getCacheStats();
    ResponseHelper.success(res, stats);
  });

  clearCache = asyncHandler(async (req, res) => {
    metadataService.clearCache();
    ResponseHelper.success(res, null, 'Cache wyczyszczony');
  });
}

module.exports = new MetadataController();