import { http } from './http';

export const batchService = {
  getAll: () => http.get('/dtes'),
  getById: (id) => http.get(`/dtes/${id}`),
  create: (data) => http.post('/dtes', data),
  getPdfUrl: (id, stream = true) => `${http.defaults.baseURL || '/api'}/dtes/${id}/pdf${stream ? '?stream=true' : ''}`,
  downloadPdf: async (id, codigoGeneracion = 'dte') => {
    const response = await http.get(`/dtes/${id}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${codigoGeneracion}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
  consultarMh: (id) => http.get(`/dtes/${id}/consultar-mh`),
  transmitir: (id) => http.post(`/dtes/${id}/transmitir`),
  enviarCorreo: (id, correo) => http.post(`/dtes/${id}/enviar-correo`, { correo }),
  getDiagnostico: () => http.get('/test/diagnostico'),
};

