const { Workspace, WorkspaceMember, Collection, User } = require('../../models');
const { Op } = require('sequelize');
const { 
  ROLES, 
  checkPermission, 
  checkOwnerOnly, 
  isOwner 
} = require('../../shared/constants/permissions');

class WorkspacesService {

  async create(userId, workspaceData) {
    const { name, description, settings } = workspaceData;

    if (!name || !name.trim()) {
      throw new Error('Nazwa workspace jest wymagana');
    }

    const workspace = await Workspace.create({
      name: name.trim(),
      description: description?.trim() || null,
      createdBy: userId,
      settings: settings || { color: '#6366f1' }
    });

    await WorkspaceMember.create({
      workspaceId: workspace.id,
      userId: userId,
      role: ROLES.ADMIN,
      joinedAt: new Date()
    });

    return workspace;
  }

  async getAll(userId) {
    const memberWorkspaces = await WorkspaceMember.findAll({
      where: { userId },
      attributes: ['workspaceId']
    });

    const workspaceIds = memberWorkspaces.map(m => m.workspaceId);

    if (workspaceIds.length === 0) {
      return [];
    }

    const workspaces = await Workspace.findAll({
      where: {
        id: { [Op.in]: workspaceIds }
      },
      include: [
        {
          model: WorkspaceMember,
          as: 'members',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'email']
            }
          ]
        },
        {
          model: Collection,
          as: 'collections',
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return workspaces;
  }

  async getById(userId, workspaceId) {
    const workspace = await Workspace.findByPk(workspaceId, {
      include: [
        {
          model: WorkspaceMember,
          as: 'members',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'email']
            }
          ]
        },
        {
          model: Collection,
          as: 'collections'
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    if (!workspace) {
      throw new Error('Workspace nie znaleziony');
    }

    const member = await WorkspaceMember.findOne({
      where: { workspaceId, userId }
    });

    checkPermission('VIEW_WORKSPACE', member);

    return workspace;
  }

  async update(userId, workspaceId, updateData) {
    const workspace = await Workspace.findByPk(workspaceId);

    if (!workspace) {
      throw new Error('Workspace nie znaleziony');
    }

    const member = await WorkspaceMember.findOne({
      where: { workspaceId, userId }
    });

    checkPermission('UPDATE_WORKSPACE', member);

    const { name, description, settings } = updateData;

    await workspace.update({
      ...(name && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(settings && { settings })
    });

    return workspace;
  }

  async delete(userId, workspaceId) {
    const workspace = await Workspace.findByPk(workspaceId);

    if (!workspace) {
      throw new Error('Workspace nie znaleziony');
    }

    checkOwnerOnly('DELETE_WORKSPACE', workspace, userId);

    await workspace.destroy();

    return { message: 'Workspace usunięty' };
  }

  async transferOwnership(userId, workspaceId, newOwnerId) {
    const workspace = await Workspace.findByPk(workspaceId);

    if (!workspace) {
      throw new Error('Workspace nie znaleziony');
    }

    checkOwnerOnly('TRANSFER_OWNERSHIP', workspace, userId);

    const newOwnerMember = await WorkspaceMember.findOne({
      where: { workspaceId, userId: newOwnerId }
    });

    if (!newOwnerMember) {
      throw new Error('Nowy właściciel musi być członkiem workspace');
    }

    await workspace.update({ createdBy: newOwnerId });

    if (newOwnerMember.role !== ROLES.ADMIN) {
      await newOwnerMember.update({ role: ROLES.ADMIN });
    }

    return { 
      message: 'Ownership przekazany',
      newOwnerId: newOwnerId 
    };
  }

  async leaveWorkspace(userId, workspaceId) {
    const workspace = await Workspace.findByPk(workspaceId);

    if (!workspace) {
      throw new Error('Workspace nie znaleziony');
    }

    if (isOwner(workspace, userId)) {
      throw new Error('Właściciel nie może opuścić workspace. Najpierw przekaż ownership lub usuń workspace.');
    }

    const member = await WorkspaceMember.findOne({
      where: { workspaceId, userId }
    });

    if (!member) {
      throw new Error('Nie jesteś członkiem tego workspace');
    }

    if (member.role === ROLES.ADMIN) {
      const adminCount = await WorkspaceMember.count({
        where: { workspaceId, role: ROLES.ADMIN }
      });

      if (adminCount <= 1) {
        throw new Error('Nie możesz opuścić workspace jako ostatni admin.');
      }
    }

    await member.destroy();

    return { message: 'Opuściłeś workspace' };
  }

  async addMember(userId, workspaceId, memberData) {
    const workspace = await Workspace.findByPk(workspaceId);
    
    if (!workspace) {
      throw new Error('Workspace nie znaleziony');
    }

    const requester = await WorkspaceMember.findOne({
      where: { workspaceId, userId }
    });

    checkPermission('INVITE_MEMBER', requester);

    if (memberData.role === ROLES.ADMIN) {
      checkOwnerOnly('ADD_ADMIN', workspace, userId);
    }

    const existingMember = await WorkspaceMember.findOne({
      where: { workspaceId, userId: memberData.userId }
    });

    if (existingMember) {
      throw new Error('User jest już członkiem workspace');
    }

    const userExists = await User.findByPk(memberData.userId);
    if (!userExists) {
      throw new Error('User nie znaleziony');
    }

    const validRoles = Object.values(ROLES);
    const role = memberData.role || ROLES.VIEWER;
    
    if (!validRoles.includes(role)) {
      throw new Error(`Nieprawidłowa rola. Dostępne: ${validRoles.join(', ')}`);
    }

    const member = await WorkspaceMember.create({
      workspaceId,
      userId: memberData.userId,
      role: role,
      joinedAt: new Date()
    });

    const memberWithUser = await WorkspaceMember.findByPk(member.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    return memberWithUser;
  }

  async removeMember(requesterId, workspaceId, targetUserId) {
    const workspace = await Workspace.findByPk(workspaceId);
    
    if (!workspace) {
      throw new Error('Workspace nie znaleziony');
    }

    const requester = await WorkspaceMember.findOne({
      where: { workspaceId, userId: requesterId }
    });

    checkPermission('REMOVE_MEMBER', requester);

    const memberToRemove = await WorkspaceMember.findOne({
      where: { workspaceId, userId: targetUserId }
    });

    if (!memberToRemove) {
      throw new Error('Członek nie znaleziony');
    }

    if (memberToRemove.userId === workspace.createdBy) {
      throw new Error('Nie można usunąć właściciela workspace');
    }

    if (memberToRemove.role === ROLES.ADMIN) {
      checkOwnerOnly('REMOVE_ADMIN', workspace, requesterId);
    }

    await memberToRemove.destroy();

    return { message: 'Członek usunięty' };
  }

  async updateMemberRole(requesterId, workspaceId, targetUserId, newRole) {
    const workspace = await Workspace.findByPk(workspaceId);
    
    if (!workspace) {
      throw new Error('Workspace nie znaleziony');
    }

    const requester = await WorkspaceMember.findOne({
      where: { workspaceId, userId: requesterId }
    });

    checkPermission('CHANGE_MEMBER_ROLE', requester);

    const memberToUpdate = await WorkspaceMember.findOne({
      where: { workspaceId, userId: targetUserId }
    });

    if (!memberToUpdate) {
      throw new Error('Członek nie znaleziony');
    }

    if (memberToUpdate.userId === workspace.createdBy) {
      throw new Error('Nie można zmienić roli właściciela');
    }

    const validRoles = Object.values(ROLES);
    if (!validRoles.includes(newRole)) {
      throw new Error(`Nieprawidłowa rola. Dostępne: ${validRoles.join(', ')}`);
    }

    if (memberToUpdate.role === ROLES.ADMIN || newRole === ROLES.ADMIN) {
      checkOwnerOnly('CHANGE_ADMIN_ROLE', workspace, requesterId);
    }

    await memberToUpdate.update({ role: newRole });

    const updatedMember = await WorkspaceMember.findByPk(memberToUpdate.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    return updatedMember;
  }

  async getMembers(userId, workspaceId) {
    const workspace = await Workspace.findByPk(workspaceId, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    if (!workspace) {
      throw new Error('Workspace nie znaleziony');
    }

    const member = await WorkspaceMember.findOne({
      where: { workspaceId, userId }
    });

    checkPermission('VIEW_MEMBERS', member);

    const members = await WorkspaceMember.findAll({
      where: { workspaceId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['joinedAt', 'ASC']]
    });

    const membersWithOwnerFlag = members.map(m => ({
      ...m.toJSON(),
      isOwner: m.userId === workspace.createdBy
    }));

    return {
      creator: workspace.creator,
      members: membersWithOwnerFlag
    };
  }
}

module.exports = new WorkspacesService();