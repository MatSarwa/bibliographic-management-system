const AppError = require('../utils/app-error');

const ROLES = {
  VIEWER: 'viewer',
  EDITOR: 'editor',
  ADMIN: 'admin'
};

const ROLE_HIERARCHY = {
  [ROLES.VIEWER]: 1,
  [ROLES.EDITOR]: 2,
  [ROLES.ADMIN]: 3
};

const PERMISSIONS = {
  // === VIEWER (przeglądanie) ===
  VIEW_WORKSPACE: [ROLES.VIEWER, ROLES.EDITOR, ROLES.ADMIN],
  VIEW_COLLECTIONS: [ROLES.VIEWER, ROLES.EDITOR, ROLES.ADMIN],
  VIEW_REFERENCES: [ROLES.VIEWER, ROLES.EDITOR, ROLES.ADMIN],
  VIEW_HISTORY: [ROLES.VIEWER, ROLES.EDITOR, ROLES.ADMIN],
  VIEW_COMMENTS: [ROLES.VIEWER, ROLES.EDITOR, ROLES.ADMIN],
  VIEW_MEMBERS: [ROLES.VIEWER, ROLES.EDITOR, ROLES.ADMIN],
  EXPORT_DATA: [ROLES.VIEWER, ROLES.EDITOR, ROLES.ADMIN],

  // === EDITOR (edycja) ===
  CREATE_COLLECTION: [ROLES.EDITOR, ROLES.ADMIN],
  UPDATE_COLLECTION: [ROLES.EDITOR, ROLES.ADMIN],
  DELETE_COLLECTION: [ROLES.EDITOR, ROLES.ADMIN],
  
  CREATE_REFERENCE: [ROLES.EDITOR, ROLES.ADMIN],
  UPDATE_REFERENCE: [ROLES.EDITOR, ROLES.ADMIN],
  DELETE_REFERENCE: [ROLES.EDITOR, ROLES.ADMIN],
  
  RESTORE_VERSION: [ROLES.EDITOR, ROLES.ADMIN],
  
  CREATE_COMMENT: [ROLES.EDITOR, ROLES.ADMIN],
  UPDATE_OWN_COMMENT: [ROLES.EDITOR, ROLES.ADMIN],
  DELETE_OWN_COMMENT: [ROLES.EDITOR, ROLES.ADMIN],
  RESOLVE_COMMENT: [ROLES.EDITOR, ROLES.ADMIN],

  // === ADMIN (zarządzanie) ===
  INVITE_MEMBER: [ROLES.ADMIN],
  REMOVE_MEMBER: [ROLES.ADMIN],
  CHANGE_MEMBER_ROLE: [ROLES.ADMIN],
  UPDATE_WORKSPACE: [ROLES.ADMIN],
  UPDATE_ANY_COMMENT: [ROLES.ADMIN],
  DELETE_ANY_COMMENT: [ROLES.ADMIN]
};

// ============================================
// UPRAWNIENIA TYLKO DLA OWNERA (createdBy)
// Sprawdzane osobno - owner to nie rola, to atrybut workspace
// ============================================
const OWNER_ONLY_ACTIONS = [
  'DELETE_WORKSPACE',
  'TRANSFER_OWNERSHIP',
  'ADD_ADMIN',
  'REMOVE_ADMIN',
  'CHANGE_ADMIN_ROLE'
];


function hasPermission(permission, role) {
  if (!PERMISSIONS[permission]) {
    console.warn(`Unknown permission: ${permission}`);
    return false;
  }
  return PERMISSIONS[permission].includes(role);
}


function checkPermission(permission, member) {
  if (!member) {
    throw new AppError('Brak dostępu do workspace', 403);
  }
  
  if (!hasPermission(permission, member.role)) {
    throw new AppError(`Brak uprawnień: ${permission}. Wymagana rola: ${PERMISSIONS[permission]?.join(' lub ')}`, 403);
  }
}


function isOwner(workspace, userId) {
  return workspace.createdBy === userId;
}

function checkOwnerOnly(action, workspace, userId) {
  if (OWNER_ONLY_ACTIONS.includes(action)) {
    if (!isOwner(workspace, userId)) {
      throw new AppError(`Tylko właściciel workspace może: ${action}`, 403);
    }
  }
}

function isRoleHigherOrEqual(role1, role2) {
  return (ROLE_HIERARCHY[role1] || 0) >= (ROLE_HIERARCHY[role2] || 0);
}

function getPermissionsForRole(role) {
  return Object.entries(PERMISSIONS)
    .filter(([_, roles]) => roles.includes(role))
    .map(([permission]) => permission);
}

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  OWNER_ONLY_ACTIONS,
  hasPermission,
  checkPermission,
  isOwner,
  checkOwnerOnly,
  isRoleHigherOrEqual,
  getPermissionsForRole
};