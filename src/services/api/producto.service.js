import { http } from './http';

export const productoService = {
  /**
   * Listar productos con existencias y KPIs en tiempo real
   * @param {Object} params { q, categoria_id, tipo_item, activo, stock_filtro, orden_por, direccion }
   */
  listar: async (params = {}) => {
    const { data } = await http.get('/productos', { params });
    return data;
  },

  /**
   * Crear un nuevo producto (con soporte para inventario inicial)
   * @param {Object} productoData
   */
  crear: async (productoData) => {
    const { data } = await http.post('/productos', productoData);
    return data;
  },

  /**
   * Consultar detalle de un producto y su historial de Kardex reciente
   * @param {number|string} id
   */
  obtener: async (id) => {
    const { data } = await http.get(`/productos/${id}`);
    return data;
  },

  /**
   * Actualizar datos comerciales de un producto
   * @param {number|string} id
   * @param {Object} productoData
   */
  actualizar: async (id, productoData) => {
    const { data } = await http.put(`/productos/${id}`, productoData);
    return data;
  },

  /**
   * Eliminar o desactivar un producto
   * @param {number|string} id
   */
  eliminar: async (id) => {
    const { data } = await http.delete(`/productos/${id}`);
    return data;
  },

  /**
   * Listar categorías de productos
   * @param {Object} params
   */
  listarCategorias: async (params = {}) => {
    const { data } = await http.get('/categorias-producto', { params });
    return data;
  },

  /**
   * Crear una nueva categoría rápida
   * @param {Object} categoriaData { nombre }
   */
  crearCategoria: async (categoriaData) => {
    const { data } = await http.post('/categorias-producto', categoriaData);
    return data;
  },

  /**
   * Consultar movimientos del Libro de Kardex Valorado
   * @param {Object} params { producto_id, tipo_movimiento, fecha_desde, fecha_hasta, q, per_page }
   */
  consultarKardex: async (params = {}) => {
    const { data } = await http.get('/kardex', { params });
    return data;
  },

  /**
   * Registrar un movimiento manual de Kardex (Compra, Ajuste, Merma, etc.)
   * @param {Object} movimientoData { producto_id, tipo_movimiento, cantidad, costo_unitario, referencia_tipo, referencia_id, observacion }
   */
  registrarMovimientoKardex: async (movimientoData) => {
    const { data } = await http.post('/kardex/movimiento', movimientoData);
    return data;
  },
};
