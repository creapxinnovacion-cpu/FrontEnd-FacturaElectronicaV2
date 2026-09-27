import { http } from './http';

export const dteService = {
  getAll: async () => {
    const { data } = await http.get('/dtes');
    return data;
  },
  
  getDiagnostico: async () => {
    const { data } = await http.get('/test/diagnostico');
    return data;
  },

  enviarCorreo: async (id, correo) => {
    const { data } = await http.post(`/dtes/${id}/enviar-correo`, { correo });
    return data;
  }
};
