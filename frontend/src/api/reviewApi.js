import api from './axios';

export const reviewApi = {
  getUserReviews: (userId) => api.get(`/reviews/user/${userId}`),
  createReview: (data) => api.post('/reviews', data),
};