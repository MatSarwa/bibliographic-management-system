import api from '../../../shared/utils/api';

const historyService = {
  async getHistory(itemId) {
    try {
      const { data } = await api.get(`/history/items/${itemId}`);
      return { success: true, data: data.data || data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Błąd pobierania historii'
      };
    }
  },

  async getVersion(itemId, version) {
    try {
      const { data } = await api.get(`/history/items/${itemId}/${version}`);
      return { success: true, data: data.data || data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Błąd pobierania wersji'
      };
    }
  },

  async restoreVersion(itemId, version) {
    try {
      const { data } = await api.post(`/history/items/${itemId}/restore/${version}`);
      return { success: true, data: data.data || data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Błąd przywracania wersji'
      };
    }
  },
};

export default historyService;