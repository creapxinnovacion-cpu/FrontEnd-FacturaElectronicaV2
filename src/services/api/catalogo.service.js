import { http } from './http';

export const catalogoService = {
  getTiposDte: () => http.get('/catalogos/tipos-dte'),
  getEstados: () => http.get('/catalogos/estados'),
  getTiposPago: () => http.get('/catalogos/tipos-pago'),
};
