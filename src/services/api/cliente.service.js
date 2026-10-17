import { http } from './http';

export const clienteService = {
  /**
   * Buscar clientes registrados para autocompletado por DUI, NIT, NRC, Teléfono o Nombre
   * @param {string} q Término de búsqueda
   * @returns {Promise<Array>} Lista de clientes
   */
  buscar: (q) => http.get('/clientes/buscar', { params: { q } }),

  /**
   * Crear o actualizar un cliente en la libreta de clientes (Upsert)
   * @param {Object} clienteData Datos del cliente
   * @returns {Promise<Object>} Cliente guardado
   */
  guardar: (clienteData) => http.post('/clientes', clienteData),
};
