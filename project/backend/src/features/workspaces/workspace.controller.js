const asyncHandler = require('../../shared/utils/async-handler');
const workspaceService = require('./workspace.service');
const ResponseHelper = require('../../shared/utils/response.helper');
const { User } = require('../../models');

class WorkspaceController {
  createWorkspace = asyncHandler(async (req, res) => {
    const { name, description, settings } = req.body;

    if (!name) {
      return ResponseHelper.error(res, 'Nazwa workspace jest wymagana', 400);
    }

    const workspace = await workspaceService.create(req.user.id, {
      name,
      description,
      settings
    });

    console.log('Workspace utworzony:', name, 'przez user:', req.user.username);

    ResponseHelper.created(res, workspace, 'Workspace utworzony pomyślnie');
  });

  getAllWorkspaces = asyncHandler(async (req, res) => {
    const workspaces = await workspaceService.getAll(req.user.id);

    ResponseHelper.success(res, workspaces);
  });

  getWorkspaceById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const workspace = await workspaceService.getById(req.user.id, id);

    ResponseHelper.success(res, workspace);
  });

  updateWorkspace = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, settings } = req.body;

    const workspace = await workspaceService.update(req.user.id, id, {
      name,
      description,
      settings
    });

    console.log('Workspace zaktualizowany:', workspace.name);

    ResponseHelper.success(res, workspace, 'Workspace zaktualizowany pomyślnie');
  });

  deleteWorkspace = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await workspaceService.delete(req.user.id, id);

    console.log('Workspace usunięty, ID:', id);

    ResponseHelper.success(res, null, result.message);
  });

  transferOwnership = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { newOwnerId } = req.body;

    if (!newOwnerId) {
      return ResponseHelper.error(res, 'ID nowego właściciela jest wymagane', 400);
    }

    const result = await workspaceService.transferOwnership(req.user.id, id, newOwnerId);

    console.log('Ownership przekazany, workspace:', id, '→ user:', newOwnerId);

    ResponseHelper.success(res, result, result.message);
  });

  addMember = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { email, username, role } = req.body;

    if (!email && !username) {
      return ResponseHelper.error(res, 'Email lub username jest wymagany', 400);
    }

    const user = await User.findOne({
      where: email 
        ? { email } 
        : { username }
    });

    if (!user) {
      return ResponseHelper.error(res, 'Użytkownik nie znaleziony', 404);
    }

    const member = await workspaceService.addMember(req.user.id, id, {
      userId: user.id,
      role: role || 'viewer'
    });

    console.log('Członek dodany do workspace:', id);

    ResponseHelper.created(res, member, 'Członek dodany pomyślnie');
  });

  removeMember = asyncHandler(async (req, res) => {
    const { id, userId } = req.params;

    const result = await workspaceService.removeMember(req.user.id, id, userId);

    console.log('Członek usunięty z workspace:', id);

    ResponseHelper.success(res, null, result.message);
  });

  updateMemberRole = asyncHandler(async (req, res) => {
    const { id, userId } = req.params;
    const { role } = req.body;

    if (!role) {
      return ResponseHelper.error(res, 'Rola jest wymagana', 400);
    }

    const member = await workspaceService.updateMemberRole(req.user.id, id, userId, role);

    console.log('Rola członka zaktualizowana:', userId, '→', role);

    ResponseHelper.success(res, member, 'Rola zaktualizowana pomyślnie');
  });

  getWorkspaceMembers = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const members = await workspaceService.getMembers(req.user.id, id);

    ResponseHelper.success(res, members);
  });

  leaveWorkspace = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await workspaceService.leaveWorkspace(req.user.id, id);

    console.log('User opuścił workspace:', id, 'user:', req.user.username);

    ResponseHelper.success(res, null, result.message);
  });
}

module.exports = new WorkspaceController();