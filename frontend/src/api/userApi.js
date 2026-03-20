import api from './axios';

export const userApi = {
  getUserById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  searchUsers: (query, page = 1) => api.get(`/users/search?query=${query}&page=${page}`),
};