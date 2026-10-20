import { API_URL } from '../../../shared/utils/api';

const request = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_URL}${url}`, config);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || 'Wystąpił błąd',
      };
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: 'Błąd połączenia z serwerem',
    };
  }
};

const workspaceService = {

  getAll: () => request('/workspaces'),

  getById: (id) => request(`/workspaces/${id}`),

  create: (data) => request('/workspaces', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => request(`/workspaces/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => request(`/workspaces/${id}`, {
    method: 'DELETE',
  }),

  getMembers: (workspaceId) => request(`/workspaces/${workspaceId}/members`),

  addMember: (workspaceId, data) => request(`/workspaces/${workspaceId}/members`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  removeMember: (workspaceId, userId) => request(`/workspaces/${workspaceId}/members/${userId}`, {
    method: 'DELETE',
  }),

  updateMemberRole: (workspaceId, userId, role) => request(`/workspaces/${workspaceId}/members/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  }),

  transferOwnership: (workspaceId, newOwnerId) => request(`/workspaces/${workspaceId}/transfer-ownership`, {
    method: 'POST',
    body: JSON.stringify({ newOwnerId }),
  }),

  leaveWorkspace: (workspaceId) => request(`/workspaces/${workspaceId}/leave`, {
    method: 'POST',
  }),

  getCollections: (workspaceId) => request(`/workspaces/${workspaceId}/collections`),

  createCollection: (workspaceId, data) => request(`/workspaces/${workspaceId}/collections`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  updateCollection: (workspaceId, collectionId, data) => request(`/workspaces/${workspaceId}/collections/${collectionId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  deleteCollection: (workspaceId, collectionId) => request(`/workspaces/${workspaceId}/collections/${collectionId}`, {
    method: 'DELETE',
  }),

  getCollectionItems: (workspaceId, collectionId) => request(`/workspaces/${workspaceId}/collections/${collectionId}/items`),
};

export default workspaceService;