const asyncHandler = require('../../shared/utils/async-handler');
const collectionSharingService = require('./collection-sharing.service');
const ResponseHelper = require('../../shared/utils/response.helper');

class CollectionSharingController {

  shareCollection = asyncHandler(async (req, res) => {
    const { collectionId } = req.params;
    const { email, username } = req.body;

    if (!email && !username) {
      return ResponseHelper.error(res, 'Email lub username jest wymagany', 400);
    }

    const member = await collectionSharingService.shareCollection(
      req.user.id,
      collectionId,
      { email, username }
    );

    const identifier = email || username;

    ResponseHelper.created(res, member, 'Kolekcja została udostępniona');
  });

  unshareCollection = asyncHandler(async (req, res) => {
    const { collectionId, userId } = req.params;

    const result = await collectionSharingService.unshareCollection(
      req.user.id,
      collectionId,
      userId
    );


    ResponseHelper.success(res, null, result.message);
  });

  getSharedUsers = asyncHandler(async (req, res) => {
    const { collectionId } = req.params;

    const users = await collectionSharingService.getSharedUsers(
      req.user.id,
      collectionId
    );

    ResponseHelper.success(res, users);
  });

  getSharedWithMe = asyncHandler(async (req, res) => {
    const collections = await collectionSharingService.getSharedWithMe(req.user.id);

    ResponseHelper.success(res, collections);
  });

  leaveSharedCollection = asyncHandler(async (req, res) => {
    const { collectionId } = req.params;

    const result = await collectionSharingService.leaveSharedCollection(
      req.user.id,
      collectionId
    );


    ResponseHelper.success(res, null, result.message);
  });
}

module.exports = new CollectionSharingController();