import api from '../../../shared/utils/api';

export const authService = {
  async login(credentials) {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  async register(userData) {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },

  async verifyEmail(token) {
    const { data } = await api.get(`/auth/verify-email?token=${token}`);
    return data;
  },

  async forgotPassword(email) {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(token, newPassword) {
    const { data } = await api.post('/auth/reset-password', { token, newPassword });
    return data;
  },

  async resendVerification(email) {
    const { data } = await api.post('/auth/resend-verification', { email });
    return data;
  },

  async logout() {
    const { data } = await api.post('/auth/logout');
    return data;
  },
};