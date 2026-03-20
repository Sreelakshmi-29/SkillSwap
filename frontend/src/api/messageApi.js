import api from './axios';

export const messageApi = {
  getMessages: (matchId, page = 1) => api.get(`/messages/${matchId}?page=${page}`),
  sendMessage: (matchId, content) => api.post(`/messages/${matchId}`, { content }),
};