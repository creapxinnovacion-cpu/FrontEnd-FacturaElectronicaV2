import { http } from './http';

export const eventoService = {
  getInvalidaciones: () => http.get('/eventos/invalidaciones'),
  invalidarDte: (data) => http.post('/eventos/invalidacion', data),
  consultarPlazoInvalidacion: (dteId) => http.get(`/eventos/invalidacion/plazo/${dteId}`),
  getRetornos: () => http.get('/eventos/retornos'),
  procesarRetorno: (data) => http.post('/eventos/retorno', data),
};
