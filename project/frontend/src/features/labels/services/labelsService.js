import api from '../../../shared/utils/api';

const labelsService = {
  async getAll() {
    try {
      const { data } = await api.get('/labels');
      return { success: true, data: data.data || data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Błąd pobierania labels'
      };
    }
  },

  async create(labelData) {
    try {
      const { data } = await api.post('/labels', labelData);
      return { success: true, data: data.data || data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Błąd tworzenia labela'
      };
    }
  },

  async update(id, labelData) {
    try {
      const { data } = await api.put(`/labels/${id}`, labelData);
      return { success: true, data: data.data || data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Błąd aktualizacji labela'
      };
    }
  },

  async delete(id) {
    try {
      const { data } = await api.delete(`/labels/${id}`);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Błąd usuwania labela'
      };
    }
  },

  async assignToItem(itemId, labelIds) {
    try {
      const { data } = await api.put(`/item-labels/${itemId}/labels`, {
        labelIds: labelIds
      });
      return { success: true, data: data.data || data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Błąd przypisywania labels'
      };
    }
  },

  async getItemLabels(itemId) {
    try {
      const { data } = await api.get(`/item-labels/${itemId}/labels`);
      return { success: true, data: data.data || data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Błąd pobierania labels'
      };
    }
  },
};

export default labelsService;