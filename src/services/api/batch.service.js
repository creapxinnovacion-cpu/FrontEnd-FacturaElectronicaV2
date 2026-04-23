import { http } from './http';

export const batchService = {
  getAll: () => http.get('/dtes'),
  getById: (id) => http.get(`/dtes/${id}`),
  create: (data) => http.post('/dtes', data),
};
