import { useState, useEffect, useCallback } from "react";
import {
  CubeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  TrashIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  DocumentTextIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  TagIcon,
  WrenchScrewdriverIcon,
  FolderPlusIcon,
} from "@heroicons/react/24/outline";
import { productoService } from "@/services/api/producto.service";
import ResumenCard from "@/components/ResumenCard";

export default function Stock() {
  // =========================================================================
  // Estados de datos
  // =========================================================================
  const [productos, setProductos] = useState([]);
  const [kpis, setKpis] = useState({
    total_productos: 0,
    total_inventariables: 0,
    total_unidades_stock: 0,
    valor_total_inventario: 0,
    productos_agotados: 0,
  });
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);

  // Filtros
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroStock, setFiltroStock] = useState(""); // "" = todos, "disponibles", "agotados"

  // Modales
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [modalKardexAbierto, setModalKardexAbierto] = useState(false);
  const [modalMovimientoAbierto, setModalMovimientoAbierto] = useState(false);
  const [modalNuevaCategoriaAbierto, setModalNuevaCategoriaAbierto] = useState(false);

  // Producto seleccionado para ver Kardex, editar o mover
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [kardexMovimientos, setKardexMovimientos] = useState([]);
  const [cargandoKardex, setCargandoKardex] = useState(false);

  // Estados de carga de formularios
  const [guardando, setGuardando] = useState(false);

  // Formulario Nuevo Producto
  const [formNuevo, setFormNuevo] = useState({
    codigo: "",
    descripcion: "",
    categoria_id: "",
    tipo_item: 1, // 1 = Bien, 2 = Servicio
    unidad_medida: "59", // 59 = Unidad
    precio_unitario: "",
    tipo_venta: 1, // 1 = Gravada IVA 13%
    controla_inventario: true,
    stock_inicial: "",
    costo_unitario_inicial: "",
  });

  // Formulario Editar Producto
  const [formEditar, setFormEditar] = useState({
    id: null,
    codigo: "",
    descripcion: "",
    categoria_id: "",
    unidad_medida: "59",
    precio_unitario: "",
    tipo_venta: 1,
    activo: true,
  });

  // Formulario Registrar Movimiento Manual
  const [formMovimiento, setFormMovimiento] = useState({
    tipo_movimiento: "ENTRADA_COMPRA",
    cantidad: "",
    costo_unitario: "",
    referencia_tipo: "COMPRA",
    observacion: "",
  });

  // Formulario Nueva Categoría rápida
  const [nuevaCategoriaNombre, setNuevaCategoriaNombre] = useState("");

  // =========================================================================
  // Carga de datos
  // =========================================================================
  const cargarCategorias = useCallback(async () => {
    try {
      const data = await productoService.listarCategorias();
      setCategorias(data);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  }, []);

  const cargarProductos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const params = {};
      if (filtroTexto.trim()) params.q = filtroTexto.trim();
      if (filtroCategoria) params.categoria_id = filtroCategoria;
      if (filtroStock) params.stock_filtro = filtroStock;

      const data = await productoService.listar(params);
      setProductos(data.productos || []);
      if (data.kpis) setKpis(data.kpis);
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setError("No se pudieron cargar los productos del inventario.");
    } finally {
      setCargando(false);
    }
  }, [filtroTexto, filtroCategoria, filtroStock]);

  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarProductos();
    }, 250);
    return () => clearTimeout(timer);
  }, [cargarProductos]);

  const mostrarExito = (mensaje) => {
    setMensajeExito(mensaje);
    setTimeout(() => setMensajeExito(null), 4000);
  };

  // =========================================================================
  // Handlers para Nuevo Producto
  // =========================================================================
  const handleGuardarNuevo = async (e) => {
    e.preventDefault();
    if (!formNuevo.codigo.trim() || !formNuevo.descripcion.trim()) {
      alert("Por favor complete el código SKU y el nombre del producto.");
      return;
    }

    setGuardando(true);
    try {
      const esServicio = Number(formNuevo.tipo_item) === 2;
      const payload = {
        codigo: formNuevo.codigo.trim(),
        descripcion: formNuevo.descripcion.trim(),
        categoria_id: formNuevo.categoria_id ? Number(formNuevo.categoria_id) : null,
        tipo_item: Number(formNuevo.tipo_item),
        unidad_medida: formNuevo.unidad_medida,
        precio_unitario: Number(formNuevo.precio_unitario) || 0,
        tipo_venta: Number(formNuevo.tipo_venta),
        controla_inventario: esServicio ? false : Boolean(formNuevo.controla_inventario),
      };

      if (payload.controla_inventario && formNuevo.stock_inicial > 0) {
        payload.stock_inicial = Number(formNuevo.stock_inicial);
        payload.costo_unitario_inicial = Number(formNuevo.costo_unitario_inicial) || 0;
      }

      await productoService.crear(payload);
      mostrarExito("¡Producto creado y registrado en inventario exitosamente!");
      setModalNuevoAbierto(false);
      setFormNuevo({
        codigo: "",
        descripcion: "",
        categoria_id: "",
        tipo_item: 1,
        unidad_medida: "59",
        precio_unitario: "",
        tipo_venta: 1,
        controla_inventario: true,
        stock_inicial: "",
        costo_unitario_inicial: "",
      });
      cargarProductos();
    } catch (err) {
      const msg = err.response?.data?.message || "Error al crear el producto.";
      alert(msg);
    } finally {
      setGuardando(false);
    }
  };

  // =========================================================================
  // Handlers para Editar Producto
  // =========================================================================
  const abrirEditar = (prod) => {
    setFormEditar({
      id: prod.id,
      codigo: prod.sku,
      descripcion: prod.nombre,
      categoria_id: prod.categoria_id || "",
      unidad_medida: prod.unidad_medida || "59",
      precio_unitario: prod.precio_unitario || 0,
      tipo_venta: prod.tipo_venta || 1,
      activo: prod.activo,
    });
    setModalEditarAbierto(true);
  };

  const handleGuardarEditar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await productoService.actualizar(formEditar.id, {
        codigo: formEditar.codigo.trim(),
        descripcion: formEditar.descripcion.trim(),
        categoria_id: formEditar.categoria_id ? Number(formEditar.categoria_id) : null,
        unidad_medida: formEditar.unidad_medida,
        precio_unitario: Number(formEditar.precio_unitario) || 0,
        tipo_venta: Number(formEditar.tipo_venta),
        activo: formEditar.activo,
      });
      mostrarExito("Producto actualizado correctamente.");
      setModalEditarAbierto(false);
      cargarProductos();
    } catch (err) {
      alert(err.response?.data?.message || "Error al actualizar el producto.");
    } finally {
      setGuardando(false);
    }
  };

  // =========================================================================
  // Handlers para Eliminar / Desactivar
  // =========================================================================
  const handleEliminar = async (prod) => {
    if (!window.confirm(`¿Está seguro de eliminar o desactivar "${prod.nombre}"?`)) {
      return;
    }

    try {
      const resp = await productoService.eliminar(prod.id);
      mostrarExito(resp.message || "Producto procesado correctamente.");
      cargarProductos();
    } catch (err) {
      alert(err.response?.data?.message || "Error al eliminar producto.");
    }
  };

  // =========================================================================
  // Handlers para Ver Kardex
  // =========================================================================
  const abrirKardex = async (prod) => {
    setProductoSeleccionado(prod);
    setModalKardexAbierto(true);
    setCargandoKardex(true);
    try {
      const resp = await productoService.consultarKardex({ producto_id: prod.id });
      setKardexMovimientos(resp.data || []);
    } catch (err) {
      console.error("Error al cargar Kardex:", err);
      alert("No se pudo obtener el historial del Kardex.");
    } finally {
      setCargandoKardex(false);
    }
  };

  // =========================================================================
  // Handlers para Movimiento Manual de Inventario (Entrada / Salida)
  // =========================================================================
  const abrirMovimiento = (prod) => {
    setProductoSeleccionado(prod);
    setFormMovimiento({
      tipo_movimiento: "ENTRADA_COMPRA",
      cantidad: "",
      costo_unitario: prod.costo_promedio > 0 ? prod.costo_promedio : "",
      referencia_tipo: "COMPRA",
      observacion: "",
    });
    setModalMovimientoAbierto(true);
  };

  const handleGuardarMovimiento = async (e) => {
    e.preventDefault();
    if (!formMovimiento.cantidad || Number(formMovimiento.cantidad) <= 0) {
      alert("Ingrese una cantidad válida mayor a cero.");
      return;
    }

    const esEntrada = formMovimiento.tipo_movimiento.startsWith("ENTRADA");
    if (esEntrada && formMovimiento.tipo_movimiento !== "ENTRADA_DEV_VENTA" && !formMovimiento.costo_unitario) {
      alert("Para las entradas de inventario se requiere especificar el costo unitario.");
      return;
    }

    setGuardando(true);
    try {
      await productoService.registrarMovimientoKardex({
        producto_id: productoSeleccionado.id,
        tipo_movimiento: formMovimiento.tipo_movimiento,
        cantidad: Number(formMovimiento.cantidad),
        costo_unitario: esEntrada ? Number(formMovimiento.costo_unitario) : null,
        referencia_tipo: formMovimiento.referencia_tipo,
        observacion: formMovimiento.observacion.trim(),
      });

      mostrarExito("¡Movimiento de Kardex registrado exitosamente!");
      setModalMovimientoAbierto(false);
      cargarProductos();

      // Si el modal de kardex está abierto, refrescarlo
      if (modalKardexAbierto) {
        abrirKardex(productoSeleccionado);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error al registrar movimiento en Kardex.");
    } finally {
      setGuardando(false);
    }
  };

  // =========================================================================
  // Handlers para Crear Nueva Categoría al Vuelo
  // =========================================================================
  const handleCrearCategoria = async (e) => {
    e.preventDefault();
    if (!nuevaCategoriaNombre.trim()) return;

    try {
      const resp = await productoService.crearCategoria({ nombre: nuevaCategoriaNombre.trim() });
      setNuevaCategoriaNombre("");
      setModalNuevaCategoriaAbierto(false);
      await cargarCategorias();
      if (resp.categoria?.id) {
        setFormNuevo((prev) => ({ ...prev, categoria_id: resp.categoria.id }));
      }
      mostrarExito("Categoría creada con éxito.");
    } catch (err) {
      alert(err.response?.data?.message || "Error al crear la categoría.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* =========================================================================
          ENCABEZADO Y ALERTA DE ÉXITO
      ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CubeIcon className="w-8 h-8 text-blue-600" /> Control de Inventario & Stock
          </h1>
          <p className="text-sm text-gray-500">
            Valuación por Costo Promedio Ponderado e integración con Facturación Electrónica (SVFE)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={cargarProductos}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition shadow-xs"
            title="Refrescar existencias"
          >
            <ArrowPathIcon className={`w-5 h-5 ${cargando ? "animate-spin text-blue-600" : ""}`} />
          </button>

          <button
            onClick={() => setModalNuevaCategoriaAbierto(true)}
            className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <FolderPlusIcon className="w-5 h-5 text-gray-500" />
            NUEVA CATEGORÍA
          </button>

          <button
            onClick={() => setModalNuevoAbierto(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <PlusIcon className="w-5 h-5" />
            NUEVO PRODUCTO
          </button>
        </div>
      </div>

      {mensajeExito && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 shadow-xs transition-all animate-fadeIn">
          <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">{mensajeExito}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 shadow-xs">
          <ExclamationTriangleIcon className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* =========================================================================
          KPIs / TARJETAS DE RESUMEN
      ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ResumenCard
          titulo="Total Artículos"
          valor={kpis.total_productos}
          color="green"
          icon={<CubeIcon className="w-6 h-6 text-emerald-600" />}
        />
        <ResumenCard
          titulo="Unidades Físicas"
          valor={Number(kpis.total_unidades_stock).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          color="green"
          icon={<TagIcon className="w-6 h-6 text-emerald-600" />}
        />
        <ResumenCard
          titulo="Valor Total Inventario"
          valor={`$ ${Number(kpis.valor_total_inventario).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          color="orange"
          icon={<CurrencyDollarIcon className="w-6 h-6 text-amber-600" />}
        />
        <ResumenCard
          titulo="Productos Agotados"
          valor={kpis.productos_agotados}
          color={kpis.productos_agotados > 0 ? "red" : "green"}
          icon={<ExclamationTriangleIcon className={`w-6 h-6 ${kpis.productos_agotados > 0 ? "text-rose-600" : "text-emerald-600"}`} />}
        />
      </div>

      {/* =========================================================================
          BARRA DE BÚSQUEDA Y FILTROS
      ========================================================================= */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-3">
        {/* Buscador */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            placeholder="Buscar por código SKU, código de barras o nombre..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
          />
          {filtroTexto && (
            <button
              onClick={() => setFiltroTexto("")}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtro Categoría */}
        <div className="w-full md:w-56">
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
          >
            <option value="">Todas las Categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre} ({cat.productos_count || 0})
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Stock */}
        <div className="w-full md:w-48">
          <select
            value={filtroStock}
            onChange={(e) => setFiltroStock(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
          >
            <option value="">Todo el Stock</option>
            <option value="disponibles">Con Existencias (&gt; 0)</option>
            <option value="agotados">Agotados (0 unidades)</option>
          </select>
        </div>
      </div>

      {/* =========================================================================
          TABLA DE PRODUCTOS
      ========================================================================= */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                <th className="px-6 py-4">Producto / Servicio</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Existencia</th>
                <th className="px-6 py-4">Costo Promedio</th>
                <th className="px-6 py-4">Precio Venta</th>
                <th className="px-6 py-4">Valor Inventario</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cargando ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <ArrowPathIcon className="w-7 h-7 mx-auto animate-spin text-blue-600 mb-2" />
                    <p className="text-sm">Cargando inventario desde la base de datos...</p>
                  </td>
                </tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <CubeIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-base font-semibold text-gray-700">No hay productos registrados</p>
                    <p className="text-sm text-gray-400">
                      {filtroTexto ? "No se encontraron coincidencias para la búsqueda." : "Comienza agregando tu primer producto con el botón 'NUEVO PRODUCTO'."}
                    </p>
                  </td>
                </tr>
              ) : (
                productos.map((prod) => {
                  const stockNum = Number(prod.stock_actual);
                  const precioNum = Number(prod.precio_unitario);
                  const costoNum = Number(prod.costo_promedio);
                  const valorNum = Number(prod.valor_inventario);
                  const esServicio = Number(prod.tipo_item) === 2;

                  return (
                    <tr key={prod.id} className="hover:bg-blue-50/40 transition">
                      {/* Producto */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 shrink-0 ${esServicio ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}>
                            {esServicio ? <WrenchScrewdriverIcon className="w-5 h-5" /> : <CubeIcon className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 leading-snug">{prod.nombre}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-500 font-medium">{prod.categoria}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-xs text-gray-400">{esServicio ? "Servicio" : "Bien Físico"}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md border border-gray-200">
                          {prod.sku}
                        </span>
                      </td>

                      {/* Stock Actual */}
                      <td className="px-6 py-4">
                        {esServicio ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            N/A (Servicio)
                          </span>
                        ) : (
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${
                              stockNum > 0
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${stockNum > 0 ? "bg-emerald-500" : "bg-rose-500"}`} />
                            {stockNum > 0 ? `${stockNum.toFixed(2)} unidades` : "Agotado (0.00)"}
                          </span>
                        )}
                      </td>

                      {/* Costo Promedio */}
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">
                        {esServicio ? "—" : `$ ${costoNum.toFixed(2)}`}
                      </td>

                      {/* Precio de Venta */}
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 font-mono">
                        $ {precioNum.toFixed(2)}
                      </td>

                      {/* Valor Total Inventario */}
                      <td className="px-6 py-4 text-sm font-mono font-medium text-gray-700">
                        {esServicio ? "—" : `$ ${valorNum.toFixed(2)}`}
                      </td>

                      {/* Botones de Acción */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Botón Ver Kardex */}
                          {!esServicio && (
                            <button
                              onClick={() => abrirKardex(prod)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Ver libro de Kardex"
                            >
                              <DocumentTextIcon className="w-5 h-5" />
                            </button>
                          )}

                          {/* Botón Registrar Entrada / Ajuste */}
                          {!esServicio && (
                            <button
                              onClick={() => abrirMovimiento(prod)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                              title="Entrada / Salida de inventario"
                            >
                              <ArrowsRightLeftIcon className="w-5 h-5" />
                            </button>
                          )}

                          {/* Botón Editar */}
                          <button
                            onClick={() => abrirEditar(prod)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                            title="Editar datos del producto"
                          >
                            <PencilSquareIcon className="w-5 h-5" />
                          </button>

                          {/* Botón Eliminar / Desactivar */}
                          <button
                            onClick={() => handleEliminar(prod)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                            title="Desactivar o eliminar"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          MODAL: NUEVO PRODUCTO
      ========================================================================= */}
      {modalNuevoAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <PlusIcon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Registrar Nuevo Producto</h3>
              </div>
              <button
                onClick={() => setModalNuevoAbierto(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleGuardarNuevo} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* SKU */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Código SKU / Código de Barras *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNuevo.codigo}
                    onChange={(e) => setFormNuevo({ ...formNuevo, codigo: e.target.value })}
                    placeholder="Ej. LP-001 o 7421000123"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Categoría */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase">
                      Categoría
                    </label>
                    <button
                      type="button"
                      onClick={() => setModalNuevaCategoriaAbierto(true)}
                      className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-0.5"
                    >
                      + Nueva
                    </button>
                  </div>
                  <select
                    value={formNuevo.categoria_id}
                    onChange={(e) => setFormNuevo({ ...formNuevo, categoria_id: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Seleccione Categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nombre / Descripción */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Descripción o Nombre Comercial *
                </label>
                <input
                  type="text"
                  required
                  value={formNuevo.descripcion}
                  onChange={(e) => setFormNuevo({ ...formNuevo, descripcion: e.target.value })}
                  placeholder="Ej. Laptop Pro 14 pulgadas 16GB RAM"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Tipo de Ítem (CAT-011) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Tipo de Ítem (MH)
                  </label>
                  <select
                    value={formNuevo.tipo_item}
                    onChange={(e) => {
                      const tipo = Number(e.target.value);
                      setFormNuevo({
                        ...formNuevo,
                        tipo_item: tipo,
                        controla_inventario: tipo === 1,
                      });
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value={1}>1 - Bien (Físico)</option>
                    <option value={2}>2 - Servicio</option>
                  </select>
                </div>

                {/* Unidad de Medida (CAT-014) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Unidad de Medida
                  </label>
                  <select
                    value={formNuevo.unidad_medida}
                    onChange={(e) => setFormNuevo({ ...formNuevo, unidad_medida: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="59">59 - Unidad</option>
                    <option value="58">58 - Kilogramo</option>
                    <option value="01">01 - Metro</option>
                    <option value="23">23 - Gramo</option>
                    <option value="99">99 - Otra</option>
                  </select>
                </div>

                {/* Precio de Venta */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Precio Venta ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formNuevo.precio_unitario}
                    onChange={(e) => setFormNuevo({ ...formNuevo, precio_unitario: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Notificación informativa cuando se selecciona Servicio */}
              {Number(formNuevo.tipo_item) === 2 && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-start gap-2.5">
                  <WrenchScrewdriverIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Control de inventario guardado como FALSE:</span>
                    <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                      Al registrar un servicio, este campo se guardará automáticamente como <strong>FALSE</strong>. De esta manera, cuando el trigger del Kardex lea la línea facturada, omitirá los servicios y no intentará buscar ni rebajar stock de tus horas de soporte o consultoría.
                    </p>
                  </div>
                </div>
              )}

              {/* Inventario Inicial (Solo para bienes físicos) */}
              {Number(formNuevo.tipo_item) === 1 && (
                <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CubeIcon className="w-4 h-4 text-blue-600" /> Carga de Inventario Inicial (Kardex)
                    </span>
                    <span className="text-xs text-blue-600 font-medium">Opcional</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Cantidad Inicial en Bodega
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={formNuevo.stock_inicial}
                        onChange={(e) => setFormNuevo({ ...formNuevo, stock_inicial: e.target.value })}
                        placeholder="0 unidades"
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Costo Unitario de Compra ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formNuevo.costo_unitario_inicial}
                        onChange={(e) => setFormNuevo({ ...formNuevo, costo_unitario_inicial: e.target.value })}
                        placeholder="0.00"
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                      />
                    </div>
                  </div>
                  {Number(formNuevo.stock_inicial) > 0 && Number(formNuevo.costo_unitario_inicial) > 0 && (
                    <p className="text-xs text-blue-800 font-medium">
                      Total valuado a ingresar al Kardex:{" "}
                      <strong>
                        $ {(Number(formNuevo.stock_inicial) * Number(formNuevo.costo_unitario_inicial)).toFixed(2)}
                      </strong>
                    </p>
                  )}
                </div>
              )}

              {/* Botones Guardar / Cancelar */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalNuevoAbierto(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer shadow-xs flex items-center gap-2"
                >
                  {guardando ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" /> Guardando...
                    </>
                  ) : (
                    "Guardar Producto"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDITAR PRODUCTO
      ========================================================================= */}
      {modalEditarAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <PencilSquareIcon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Editar Producto</h3>
              </div>
              <button
                onClick={() => setModalEditarAbierto(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleGuardarEditar} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Código SKU
                </label>
                <input
                  type="text"
                  required
                  value={formEditar.codigo}
                  onChange={(e) => setFormEditar({ ...formEditar, codigo: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Descripción Comercial
                </label>
                <input
                  type="text"
                  required
                  value={formEditar.descripcion}
                  onChange={(e) => setFormEditar({ ...formEditar, descripcion: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Categoría
                  </label>
                  <select
                    value={formEditar.categoria_id}
                    onChange={(e) => setFormEditar({ ...formEditar, categoria_id: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Sin Categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Precio Venta ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formEditar.precio_unitario}
                    onChange={(e) => setFormEditar({ ...formEditar, precio_unitario: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalEditarAbierto(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer shadow-xs flex items-center gap-2"
                >
                  {guardando ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" /> Guardando...
                    </>
                  ) : (
                    "Guardar Cambios"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: HISTORIAL DEL KARDEX VALORADO
      ========================================================================= */}
      {modalKardexAbierto && productoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    Kardex Valorado — {productoSeleccionado.nombre}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  SKU: <span className="font-mono font-bold text-gray-700">{productoSeleccionado.sku}</span> | Saldo
                  Actual:{" "}
                  <strong className="text-emerald-700">{Number(productoSeleccionado.stock_actual || 0).toFixed(2)} unidades</strong> | Costo
                  Promedio:{" "}
                  <strong className="text-gray-900">$ {Number(productoSeleccionado.costo_promedio).toFixed(2)}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => abrirMovimiento(productoSeleccionado)}
                  className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <PlusIcon className="w-4 h-4" /> Registrar Movimiento
                </button>
                <button
                  onClick={() => setModalKardexAbierto(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {cargandoKardex ? (
                <div className="py-12 text-center text-gray-500">
                  <ArrowPathIcon className="w-7 h-7 mx-auto animate-spin text-blue-600 mb-2" />
                  <p className="text-sm">Cargando libro de Kardex...</p>
                </div>
              ) : kardexMovimientos.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <DocumentTextIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-semibold text-gray-600">No hay movimientos registrados para este producto.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2.5 font-bold text-gray-600">Fecha</th>
                      <th className="px-3 py-2.5 font-bold text-gray-600">Tipo Movimiento</th>
                      <th className="px-3 py-2.5 font-bold text-emerald-700 text-right">Entrada Cant.</th>
                      <th className="px-3 py-2.5 font-bold text-emerald-700 text-right">Costo Ent.</th>
                      <th className="px-3 py-2.5 font-bold text-rose-700 text-right">Salida Cant.</th>
                      <th className="px-3 py-2.5 font-bold text-rose-700 text-right">Costo Sal.</th>
                      <th className="px-3 py-2.5 font-bold text-blue-900 text-right">Saldo Cant.</th>
                      <th className="px-3 py-2.5 font-bold text-blue-900 text-right">Costo Promedio</th>
                      <th className="px-3 py-2.5 font-bold text-blue-900 text-right">Saldo Valor</th>
                      <th className="px-3 py-2.5 font-bold text-gray-600">Observación / Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono">
                    {kardexMovimientos.map((k) => (
                      <tr key={k.kardex_id} className="hover:bg-gray-50/60 transition">
                        <td className="px-3 py-2 font-sans text-gray-700">{k.fecha}</td>
                        <td className="px-3 py-2 font-sans font-semibold">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] ${
                              k.tipo_movimiento.startsWith("ENTRADA")
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {k.tipo_movimiento}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right text-emerald-700 font-bold">
                          {Number(k.entrada_cantidad) > 0 ? Number(k.entrada_cantidad).toFixed(2) : "—"}
                        </td>
                        <td className="px-3 py-2 text-right text-emerald-700">
                          {Number(k.entrada_costo_unitario) > 0 ? `$ ${Number(k.entrada_costo_unitario).toFixed(2)}` : "—"}
                        </td>
                        <td className="px-3 py-2 text-right text-rose-700 font-bold">
                          {Number(k.salida_cantidad) > 0 ? Number(k.salida_cantidad).toFixed(2) : "—"}
                        </td>
                        <td className="px-3 py-2 text-right text-rose-700">
                          {Number(k.salida_costo_unitario) > 0 ? `$ ${Number(k.salida_costo_unitario).toFixed(2)}` : "—"}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-blue-900">
                          {Number(k.saldo_cantidad).toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-900 font-bold">
                          $ {Number(k.saldo_costo_promedio).toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-900 font-bold">
                          $ {Number(k.saldo_valor).toFixed(2)}
                        </td>
                        <td className="px-3 py-2 font-sans text-gray-500 text-[11px] max-w-xs truncate">
                          {k.observacion || (k.referencia_tipo ? `${k.referencia_tipo} #${k.referencia_id}` : "—")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: REGISTRAR MOVIMIENTO MANUAL DE INVENTARIO
      ========================================================================= */}
      {modalMovimientoAbierto && productoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <ArrowsRightLeftIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Movimiento de Kardex</h3>
                  <p className="text-xs text-gray-500">{productoSeleccionado.nombre}</p>
                </div>
              </div>
              <button
                onClick={() => setModalMovimientoAbierto(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleGuardarMovimiento} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Tipo de Movimiento
                </label>
                <select
                  value={formMovimiento.tipo_movimiento}
                  onChange={(e) =>
                    setFormMovimiento({
                      ...formMovimiento,
                      tipo_movimiento: e.target.value,
                    })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <optgroup label="Entradas de Mercadería">
                    <option value="ENTRADA_COMPRA">ENTRADA_COMPRA (Compra a proveedor)</option>
                    <option value="ENTRADA_AJUSTE">ENTRADA_AJUSTE (Ajuste sobrante / toma física)</option>
                    <option value="ENTRADA_DEV_VENTA">ENTRADA_DEV_VENTA (Devolución de cliente)</option>
                  </optgroup>
                  <optgroup label="Salidas de Mercadería">
                    <option value="SALIDA_VENTA">SALIDA_VENTA (Venta manual / salida)</option>
                    <option value="SALIDA_AJUSTE">SALIDA_AJUSTE (Merma, daño o faltante)</option>
                    <option value="SALIDA_DEV_COMPRA">SALIDA_DEV_COMPRA (Devolución a proveedor)</option>
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formMovimiento.cantidad}
                    onChange={(e) => setFormMovimiento({ ...formMovimiento, cantidad: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Costo Unitario ($) {formMovimiento.tipo_movimiento.startsWith("ENTRADA") ? "*" : "(Auto)"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    disabled={!formMovimiento.tipo_movimiento.startsWith("ENTRADA")}
                    required={formMovimiento.tipo_movimiento.startsWith("ENTRADA") && formMovimiento.tipo_movimiento !== "ENTRADA_DEV_VENTA"}
                    value={formMovimiento.costo_unitario}
                    onChange={(e) => setFormMovimiento({ ...formMovimiento, costo_unitario: e.target.value })}
                    placeholder={!formMovimiento.tipo_movimiento.startsWith("ENTRADA") ? "Costo Promedio" : "0.00"}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-mono disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Observación o Motivo
                </label>
                <input
                  type="text"
                  value={formMovimiento.observacion}
                  onChange={(e) => setFormMovimiento({ ...formMovimiento, observacion: e.target.value })}
                  placeholder="Ej. Factura Proveedor #1234 o Merma en bodega"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalMovimientoAbierto(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer shadow-xs flex items-center gap-2"
                >
                  {guardando ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" /> Registrando...
                    </>
                  ) : (
                    "Registrar Movimiento"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREAR CATEGORÍA RÁPIDA
      ========================================================================= */}
      {modalNuevaCategoriaAbierto && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-gray-900">Nueva Categoría</h4>
              <button
                onClick={() => setModalNuevaCategoriaAbierto(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearCategoria} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={nuevaCategoriaNombre}
                  onChange={(e) => setNuevaCategoriaNombre(e.target.value)}
                  placeholder="Ej. Accesorios, Bebidas..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNuevaCategoriaAbierto(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
