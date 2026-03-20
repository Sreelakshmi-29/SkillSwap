import api from './axios';

export const skillApi = {
  getMySkills: () => api.get('/skills/mine'),
  getUserSkills: (userId) => api.get(`/skills/user/${userId}`),
  addSkill: (data) => api.post('/skills', data),
  updateSkill: (id, data) => api.put(`/skills/${id}`, data),
  deleteSkill: (id) => api.delete(`/skills/${id}`),
};