import api from '../../../shared/utils/api';

const commentsService = {
  async getComments(itemId) {
    try {
      const { data } = await api.get(`/comments/items/${itemId}/comments`);
      return { success: true, data: data.data || data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Błąd pobierania komentarzy'
      };
    }
  },

  async addComment(itemId, content) {
    try {
      const { data } = await api.post(`/comments/items/${itemId}/comments`, { content });
      return { success: true, data: data.data || data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Błąd dodawania komentarza'
      };
    }
  },

  async updateComment(commentId, content) {
    try {
      const { data } = await api.put(`/comments/${commentId}`, { content });
      return { success: true, data: data.data || data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Błąd aktualizacji komentarza'
      };
    }
  },

  async deleteComment(commentId) {
    try {
      const { data } = await api.delete(`/comments/${commentId}`);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Błąd usuwania komentarza'
      };
    }
  },

  async resolveComment(commentId) {
    try {
      const { data } = await api.post(`/comments/${commentId}/resolve`);
      return { success: true, data: data.data || data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Błąd oznaczania komentarza'
      };
    }
  },
};

export default commentsService;