import { useState, useEffect, useRef } from "react";
import {
  XMarkIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  CubeIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { CAT_TIPOITEM } from "../utils/catalogos/catTipoItem";
import { CAT_UNIDAD_MEDIDA } from "../utils/catalogos/catUnidadMedida";
import { CAT_TRIBUTOS } from "../utils/catalogos/catTributos";
import { productoService } from "../services/api/producto.service";

export default function ModalItemDte({ isOpen, onClose, onSave, initialData = null }) {
  const [productoId, setProductoId] = useState(null);
  const [tipoItem, setTipoItem] = useState("1"); // 1 - Bien, 2 - Servicio, 3 - Ambos
  const [cantidad, setCantidad] = useState(1);
  const [unidadMedida, setUnidadMedida] = useState("59"); // 59 - Unidad
  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipoVenta, setTipoVenta] = useState("Gravado"); // Gravado, Exento, No sujeto
  const [precio, setPrecio] = useState("");
  const [descuento, setDescuento] = useState(0);

  // Búsqueda en catálogo de productos / servicios
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [productoSeleccionadoInfo, setProductoSeleccionadoInfo] = useState(null);

  // Tributos seleccionados (por defecto 20 = IVA 13%)
  const [tributos, setTributos] = useState(["20"]);
  const [tributosInfo, setTributosInfo] = useState([]);

  // Estados para dropdowns de tributos
  const [menuTributosOpen, setMenuTributosOpen] = useState(false);
  const [menuInfoOpen, setMenuInfoOpen] = useState(false);

  const [errorValidacion, setErrorValidacion] = useState("");

  const menuTributosRef = useRef(null);
  const menuInfoRef = useRef(null);
  const buscadorRef = useRef(null);

  // Cerrar dropdowns si se hace clic afuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuTributosRef.current && !menuTributosRef.current.contains(event.target)) {
        setMenuTributosOpen(false);
      }
      if (menuInfoRef.current && !menuInfoRef.current.contains(event.target)) {
        setMenuInfoOpen(false);
      }
      if (buscadorRef.current && !buscadorRef.current.contains(event.target)) {
        setMostrarResultados(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resetForm = () => {
    setProductoId(null);
    setTipoItem("1");
    setCantidad(1);
    setUnidadMedida("59");
    setCodigo("");
    setDescripcion("");
    setTipoVenta("Gravado");
    setPrecio("");
    setDescuento(0);
    setTributos(["20"]);
    setTributosInfo([]);
    setErrorValidacion("");
    setBusqueda("");
    setResultados([]);
    setMostrarResultados(false);
    setProductoSeleccionadoInfo(null);
  };

  // Cargar datos iniciales si es edición
  useEffect(() => {
    if (initialData) {
      setProductoId(initialData.producto_id || null);
      setTipoItem(initialData.tipoItem || "1");
      setCantidad(initialData.cantidad || 1);
      setUnidadMedida(initialData.unidadMedida || "59");
      setCodigo(initialData.codigo || "");
      setDescripcion(initialData.descripcion || "");
      setTipoVenta(initialData.tipoVenta || "Gravado");
      setPrecio(initialData.precio !== undefined ? initialData.precio : "");
      setDescuento(initialData.descuento || 0);
      setTributos(initialData.tributos || ["20"]);
      setTributosInfo(initialData.tributosInfo || []);
      setProductoSeleccionadoInfo(null);
    } else {
      resetForm();
    }
    setErrorValidacion("");
  }, [initialData, isOpen]);

  // Búsqueda en catálogo
  const handleBuscarCatalogo = async (termino) => {
    setBusqueda(termino);
    if (!termino.trim()) {
      setResultados([]);
      setMostrarResultados(false);
      return;
    }

    setBuscando(true);
    try {
      const resp = await productoService.listar({ q: termino.trim(), activo: "true" });
      setResultados(resp.productos || []);
      setMostrarResultados(true);
    } catch (err) {
      console.error("Error buscando en catálogo:", err);
    } finally {
      setBuscando(false);
    }
  };

  // Autocompletar campos desde el catálogo
  const seleccionarProducto = (prod) => {
    setProductoId(prod.id);
    setTipoItem(String(prod.tipo_item || "1"));
    setUnidadMedida(prod.unidad_medida || "59");
    setCodigo(prod.sku || "");
    setDescripcion(prod.nombre || "");
    setPrecio(prod.precio_unitario !== undefined && prod.precio_unitario !== null ? String(prod.precio_unitario) : "");

    if (Number(prod.tipo_venta) === 2) {
      setTipoVenta("Exento");
    } else if (Number(prod.tipo_venta) === 3) {
      setTipoVenta("No sujeto");
    } else {
      setTipoVenta("Gravado");
    }

    setProductoSeleccionadoInfo(prod);
    setBusqueda("");
    setResultados([]);
    setMostrarResultados(false);
  };

  // Cálculo del total reactivo
  const cantNum = parseFloat(cantidad) || 0;
  const precioNum = parseFloat(precio) || 0;
  const descNum = parseFloat(descuento) || 0;
  const subtotalBruto = cantNum * precioNum;
  const totalCalculado = Math.max(0, subtotalBruto - descNum);

  const toggleTributo = (codigoTributo) => {
    if (tributos.includes(codigoTributo)) {
      setTributos(tributos.filter((c) => c !== codigoTributo));
    } else {
      setTributos([...tributos, codigoTributo]);
    }
  };

  const toggleTributoInfo = (codigoTributo) => {
    if (tributosInfo.includes(codigoTributo)) {
      setTributosInfo(tributosInfo.filter((c) => c !== codigoTributo));
    } else {
      setTributosInfo([...tributosInfo, codigoTributo]);
    }
  };

  const handleGuardar = (e) => {
    e.preventDefault();
    if (!descripcion.trim()) {
      setErrorValidacion("El nombre o descripción del producto es requerido.");
      return;
    }
    if (cantNum <= 0) {
      setErrorValidacion("La cantidad debe ser mayor a 0.");
      return;
    }
    if (precio === "" || precioNum < 0) {
      setErrorValidacion("El precio debe ser un número válido igual o mayor a 0.");
      return;
    }

    const unidadObj = CAT_UNIDAD_MEDIDA.find((u) => u.codigo === unidadMedida) || { descripcion: "Unidad", codigo: "59" };

    const itemFinal = {
      id: initialData?.id || Date.now(),
      producto_id: productoId || initialData?.producto_id || null,
      tipoItem,
      cantidad: cantNum,
      unidadMedida,
      unidadMedidaDesc: unidadObj.descripcion,
      codigo: codigo.trim(),
      descripcion: descripcion.trim(),
      tipoVenta,
      precio: precioNum,
      descuento: descNum,
      total: parseFloat(totalCalculado.toFixed(2)),
      subTotalGravado: tipoVenta === "Gravado" ? parseFloat(totalCalculado.toFixed(2)) : 0,
      subTotalExento: tipoVenta === "Exento" ? parseFloat(totalCalculado.toFixed(2)) : 0,
      subTotalNoSujeto: tipoVenta === "No sujeto" ? parseFloat(totalCalculado.toFixed(2)) : 0,
      tributos,
      tributosInfo,
    };

    onSave(itemFinal);
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const listaTributos1 = CAT_TRIBUTOS["1"] || [];
  const listaTributos3 = CAT_TRIBUTOS["3"] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        {/* HEADER MODAL */}
        <div className="bg-[#0088FF] text-white px-6 py-3.5 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
            <CubeIcon className="w-5 h-5 text-white" /> Ítem DTE
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENIDO MODAL */}
        <form onSubmit={handleGuardar} className="p-6 overflow-y-auto space-y-5 flex-1 text-gray-800">
          <div>
            <h3 className="text-sm font-bold text-gray-700 border-b border-gray-100 pb-2 flex items-center justify-between">
              <span>Adición detalle de DTE</span>
              <span className="text-xs font-normal text-gray-400">
                Puedes buscar en inventario o escribir libremente
              </span>
            </h3>
          </div>

          {errorValidacion && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
              {errorValidacion}
            </div>
          )}

          {/* =========================================================================
              BARRA DE BÚSQUEDA / AUTOCOMPLETADO DESDE CATÁLOGO
          ========================================================================= */}
          <div ref={buscadorRef} className="relative bg-blue-50/70 border border-blue-200/90 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-blue-900 flex items-center gap-1.5 uppercase tracking-wider">
                <MagnifyingGlassIcon className="w-4 h-4 text-blue-600" />
                Buscar en Catálogo de Productos o Servicios:
              </label>
              {productoSeleccionadoInfo && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <CheckCircleIcon className="w-3.5 h-3.5" /> Vinculado a {productoSeleccionadoInfo.sku}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Escribe el nombre o SKU (Ej. Laptop Pro, Mantenimiento, Consultoría)..."
                value={busqueda}
                onChange={(e) => handleBuscarCatalogo(e.target.value)}
                onFocus={() => {
                  if (resultados.length > 0) setMostrarResultados(true);
                }}
                className="w-full bg-white border border-blue-300 rounded-lg pl-9 pr-9 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              <MagnifyingGlassIcon className="w-4 h-4 text-blue-500 absolute left-3 top-2.5" />

              {buscando ? (
                <ArrowPathIcon className="w-4 h-4 text-blue-500 absolute right-3 top-2.5 animate-spin" />
              ) : busqueda ? (
                <button
                  type="button"
                  onClick={() => {
                    setBusqueda("");
                    setResultados([]);
                    setMostrarResultados(false);
                  }}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              ) : null}
            </div>

            {/* Dropdown flotante con resultados */}
            {mostrarResultados && resultados.length > 0 && (
              <div className="absolute left-3 right-3 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto divide-y divide-gray-100">
                {resultados.map((prod) => {
                  const esServ = Number(prod.tipo_item) === 2;
                  const stockNum = Number(prod.stock_actual);
                  return (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => seleccionarProducto(prod)}
                      className="w-full text-left p-3 hover:bg-blue-50/80 transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${esServ ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}>
                          {esServ ? <WrenchScrewdriverIcon className="w-4 h-4" /> : <CubeIcon className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 group-hover:text-blue-700">
                            {prod.nombre}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                            <span className="font-mono bg-gray-100 px-1 rounded text-gray-700 font-bold">{prod.sku}</span>
                            <span>•</span>
                            <span>{prod.categoria}</span>
                            <span>•</span>
                            <span className={esServ ? "text-amber-600 font-semibold" : "text-blue-600 font-semibold"}>
                              {esServ ? "Servicio" : "Bien Físico"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-bold font-mono text-gray-900">
                          $ {Number(prod.precio_unitario || 0).toFixed(2)}
                        </p>
                        {!esServ && (
                          <span className={`text-[10px] font-semibold ${stockNum > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {stockNum > 0 ? `${stockNum.toFixed(2)} disp.` : "Agotado (0.00)"}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* FILA 1: TIPO DE ÍTEM (CAT-011) */}
          <div className="flex items-center gap-4">
            <label className="text-xs font-bold text-gray-700 w-24">Tipo de Ítem:</label>
            <div className="w-64">
              <select
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
                value={tipoItem}
                onChange={(e) => setTipoItem(e.target.value)}
              >
                {CAT_TIPOITEM.slice(0, 3).map((t) => (
                  <option key={t.codigo} value={t.codigo}>
                    {t.codigo} - {t.codigo === "1" ? "Bien (Físico)" : t.codigo === "2" ? "Servicio" : "Bien y servicio"}
                  </option>
                ))}
              </select>
            </div>
            {tipoItem === "2" && (
              <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                ℹ️ Los servicios no descontarán existencias en el Kardex.
              </span>
            )}
          </div>

          {/* FILA 2: CAMPOS EDITABLES (Cantidad, Unidad, Código, Producto, Tipo Venta, Precio) */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-start">
            {/* Cantidad */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Cantidad</label>
              <input
                type="number"
                step="any"
                min="0.0001"
                placeholder="Cantidad"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none font-mono"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
              <span className="text-[10px] text-red-500 font-semibold block">Requerido.</span>
            </div>

            {/* Unidad de Medida */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Unidad</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
                value={unidadMedida}
                onChange={(e) => setUnidadMedida(e.target.value)}
              >
                {CAT_UNIDAD_MEDIDA.map((u) => (
                  <option key={u.codigo} value={u.codigo}>
                    {u.descripcion}
                  </option>
                ))}
              </select>
            </div>

            {/* Código SKU (Editable) */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Código</label>
              <input
                type="text"
                placeholder="Código"
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none font-mono"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
            </div>

            {/* Producto / Descripción (Editable) */}
            <div className="space-y-1 md:col-span-1">
              <label className="text-xs font-medium text-gray-700">Producto / Detalle</label>
              <input
                type="text"
                placeholder="Nombre Producto"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
              <span className="text-[10px] text-red-500 font-semibold block">Requerido.</span>
            </div>

            {/* Tipo Venta */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Tipo Venta</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
                value={tipoVenta}
                onChange={(e) => setTipoVenta(e.target.value)}
              >
                <option value="Gravado">Gravado</option>
                <option value="Exento">Exento</option>
                <option value="No sujeto">No sujeto</option>
              </select>
            </div>

            {/* Precio (Editable) */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Precio ($)</label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="Precio"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none font-mono font-bold"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
              />
            </div>
          </div>

          {/* FILA 3: TRIBUTOS Y DESCUENTOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end pt-2">
            {/* Información de tributos */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">Información de los tributos</label>
              <div className="flex flex-wrap gap-2">
                {/* Botón Dropdown Impuesto */}
                <div className="relative" ref={menuTributosRef}>
                  <button
                    type="button"
                    onClick={() => setMenuTributosOpen(!menuTributosOpen)}
                    className="bg-[#0088FF] text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-blue-600 transition"
                  >
                    Impuesto <ChevronDownIcon className="w-3.5 h-3.5" />
                  </button>

                  {menuTributosOpen && (
                    <div className="absolute left-0 bottom-full mb-1 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto p-2">
                      <div className="text-[10px] font-bold text-gray-400 uppercase px-2 py-1">Tributos CAT-015</div>
                      {listaTributos1.map((t) => (
                        <label key={t.codigo} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tributos.includes(t.codigo)}
                            onChange={() => toggleTributo(t.codigo)}
                            className="rounded text-blue-600"
                          />
                          <span className="truncate">[{t.codigo}] {t.descripcion}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botón Dropdown Impuestos Informativos */}
                <div className="relative" ref={menuInfoRef}>
                  <button
                    type="button"
                    onClick={() => setMenuInfoOpen(!menuInfoOpen)}
                    className="bg-[#0088FF] text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-blue-600 transition"
                  >
                    Impuestos Informativos <ChevronDownIcon className="w-3.5 h-3.5" />
                  </button>

                  {menuInfoOpen && (
                    <div className="absolute left-0 bottom-full mb-1 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto p-2">
                      <div className="text-[10px] font-bold text-gray-400 uppercase px-2 py-1">Informativos CAT-015</div>
                      {listaTributos3.map((t) => (
                        <label key={t.codigo} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tributosInfo.includes(t.codigo)}
                            onChange={() => toggleTributoInfo(t.codigo)}
                            className="rounded text-blue-600"
                          />
                          <span className="truncate">[{t.codigo}] {t.descripcion}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tags de tributos seleccionados */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tributos.map((cod) => {
                  const t = listaTributos1.find((item) => item.codigo === cod) || { descripcion: "IVA 13%" };
                  return (
                    <span key={cod} className="bg-gray-100 text-gray-700 text-[11px] font-medium px-2 py-0.5 rounded-md border border-gray-200 flex items-center gap-1">
                      [{cod} - {t.descripcion}]
                      <button type="button" onClick={() => toggleTributo(cod)} className="text-gray-400 hover:text-gray-700">
                        &times;
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Descuento y Total */}
            <div className="flex items-center gap-4 justify-end">
              <div className="space-y-1 w-28">
                <label className="text-xs font-medium text-gray-700">Descuento</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none font-mono"
                  value={descuento}
                  onChange={(e) => setDescuento(e.target.value)}
                />
              </div>

              <div className="space-y-1 w-32">
                <label className="text-xs font-medium text-gray-700">Total</label>
                <div className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 text-right font-mono">
                  $ {totalCalculado.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* BOTONES ACCIÓN MODAL */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="bg-[#0088FF] hover:bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              {initialData ? "Actualizar Ítem" : "Agregar Ítem"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-white border border-blue-400 text-blue-600 hover:bg-blue-50 font-bold text-xs px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
