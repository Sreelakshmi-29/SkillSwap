import api from './axios';

export const matchApi = {
  getMyMatches: () => api.get('/matches'),
  getPotentialMatches: () => api.get('/matches/potential'),
  getMatchById: (id) => api.get(`/matches/${id}`),
  createMatch: (targetUserId) => api.post('/matches', { targetUserId }),
  cancelMatch: (id) => api.put(`/matches/${id}/cancel`),
};