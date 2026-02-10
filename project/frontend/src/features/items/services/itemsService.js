import api from '../../../shared/utils/api';

const itemsService = {
  async getAll(filters = {}) {
    const { data } = await api.get('/items', { params: filters });   
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/items/${id}`);
    return data;
  },

  async create(itemData) {
    const { data } = await api.post('/items', itemData);
    return data;
  },

  async update(id, itemData) {
    const { data } = await api.put(`/items/${id}`, itemData);    
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`/items/${id}`);
    return data;
  },

  async toggleFavorite(id) {
    const { data } = await api.patch(`/items/${id}/favorite`);
    return data;
  },

  async getTrash() {
    const { data } = await api.get('/items/trash');    
    return data;
  },

  async restore(id) {
    const { data } = await api.post(`/items/${id}/restore`);
    return data;
  },

  async permanentDelete(id) {
    const { data } = await api.delete(`/items/${id}/permanent`);
    return data;
  },
};

export default itemsService;