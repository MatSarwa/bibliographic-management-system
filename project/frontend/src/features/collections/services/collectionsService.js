import api from '../../../shared/utils/api';

const collectionsService = {
  async getAll() {
    try {
      const { data } = await api.get('/collections');
      
      const collections = (data.data || data).map(col => {
        const members = col.memberships || col.members || [];
        
        return {
          ...col,
          sharedWith: members 
        };
      });
      
      
      return { success: true, data: collections };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Błąd pobierania kolekcji'
      };
    }
  },

  async getById(id) {
    try {
      const { data } = await api.get(`/collections/${id}`);
      return { success: true, data: data.data || data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Błąd pobierania kolekcji'
      };
    }
  },

  async create(collectionData) {
    try {
      const { data } = await api.post('/collections', collectionData);
      return { success: true, data: data.data || data };
    } catch (error) {
      console.error('API error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Błąd tworzenia kolekcji'
      };
    }
  },

  async update(id, collectionData) {
    try {
      const { data } = await api.put(`/collections/${id}`, collectionData);
      return { success: true, data: data.data || data };
    } catch (error) {
      console.error('API error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Błąd aktualizacji kolekcji'
      };
    }
  },

  async delete(id) {
    try {
      const { data } = await api.delete(`/collections/${id}`);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Błąd usuwania kolekcji'
      };
    }
  },

  async getItems(id) {
    try {
      const { data } = await api.get(`/collections/${id}/items`);
      return { success: true, data: data.data || data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Błąd pobierania elementów'
      };
    }
  },

  async shareCollection(collectionId, userData) {
    try {
      const { data } = await api.post(`/collection-sharing/${collectionId}/share`, userData);
      return { success: true, data: data.data || data };
    } catch (error) {
      console.error('Share error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Błąd udostępniania kolekcji'
      };
    }
  },

  async unshareCollection(collectionId, userId) {
    try {
      const { data } = await api.delete(`/collection-sharing/${collectionId}/share/${userId}`);
      return { success: true, data };
    } catch (error) {
      console.error('Unshare error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Błąd usuwania dostępu'
      };
    }
  },

  async getSharedUsers(collectionId) {
    try {
      const { data } = await api.get(`/collection-sharing/${collectionId}/shared-users`);
      return { success: true, data: data.data || data };
    } catch (error) {
      console.error('Get shared users error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Błąd pobierania użytkowników'
      };
    }
  },

  async getSharedWithMe() {
    try {
      const { data } = await api.get('/collection-sharing/shared-with-me');
      return { success: true, data: data.data || data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Błąd pobierania shared kolekcji'
      };
    }
  },

  async leaveSharedCollection(collectionId) {
    try {
      const { data } = await api.delete(`/collection-sharing/${collectionId}/leave`);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Błąd opuszczania kolekcji'
      };
    }
  },
};

export default collectionsService;