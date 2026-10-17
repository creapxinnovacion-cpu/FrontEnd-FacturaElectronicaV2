import { http } from './http';

export const eventoService = {
  getInvalidaciones: () => http.get('/eventos/invalidaciones'),
  invalidarDte: (data) => http.post('/eventos/invalidacion', data),
  consultarPlazoInvalidacion: (dteId) => http.get(`/eventos/invalidacion/plazo/${dteId}`),
  getRetornos: () => http.get('/eventos/retornos'),
  procesarRetorno: (data) => http.post('/eventos/retorno', data),
  getContingencias: () => http.get('/eventos/contingencias'),
  transmitirContingencia: (data) => http.post('/eventos/contingencia', data),
  acreditarPruebasContingencia: (count = 5) => http.post('/eventos/contingencia/pruebas-acreditacion', { count }),
};
