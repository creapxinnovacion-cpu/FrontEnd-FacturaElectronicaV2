import { http } from './http';

export const emisorService = {
  getAll: () => http.get('/emisores'),
  getById: (id) => http.get(`/emisores/${id}`),
  create: (data) => http.post('/emisores', data),
  update: (id, data) => http.put(`/emisores/${id}`, data),
  delete: (id) => http.delete(`/emisores/${id}`),
  uploadCertificate: (id, formData) => http.post(`/emisores/${id}/certificado`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};
