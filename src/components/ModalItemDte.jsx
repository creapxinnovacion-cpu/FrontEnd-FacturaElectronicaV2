import { useState, useEffect, useRef } from "react";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { CAT_TIPOITEM } from "../utils/catalogos/catTipoItem";
import { CAT_UNIDAD_MEDIDA } from "../utils/catalogos/catUnidadMedida";
import { CAT_TRIBUTOS } from "../utils/catalogos/catTributos";

export default function ModalItemDte({ isOpen, onClose, onSave, initialData = null }) {
  const [tipoItem, setTipoItem] = useState("1"); // 1 - Bien, 2 - Servicio, 3 - Ambos
  const [cantidad, setCantidad] = useState(1);
  const [unidadMedida, setUnidadMedida] = useState("59"); // 59 - Unidad
  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipoVenta, setTipoVenta] = useState("Gravado"); // Gravado, Exento, No sujeto
  const [precio, setPrecio] = useState("");
  const [descuento, setDescuento] = useState(0);

  // Tributos seleccionados (por defecto 20 = IVA 13%)
  const [tributos, setTributos] = useState(["20"]);
  const [tributosInfo, setTributosInfo] = useState([]);

  // Estados para dropdowns de tributos
  const [menuTributosOpen, setMenuTributosOpen] = useState(false);
  const [menuInfoOpen, setMenuInfoOpen] = useState(false);

  const [errorValidacion, setErrorValidacion] = useState("");

  const menuTributosRef = useRef(null);
  const menuInfoRef = useRef(null);

  // Cerrar dropdowns si se hace clic afuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuTributosRef.current && !menuTributosRef.current.contains(event.target)) {
        setMenuTributosOpen(false);
      }
      if (menuInfoRef.current && !menuInfoRef.current.contains(event.target)) {
        setMenuInfoOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resetForm = () => {
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
  };

  // Cargar datos iniciales si es edición
  useEffect(() => {
    if (initialData) {
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
    } else {
      resetForm();
    }
    setErrorValidacion("");
  }, [initialData, isOpen]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* ENCABEZADO AZUL OFICIAL (Ítem DTE) */}
        <div className="bg-[#0088FF] text-white px-6 py-3.5 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-wide">Ítem DTE</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENIDO MODAL */}
        <form onSubmit={handleGuardar} className="p-6 overflow-y-auto space-y-6 flex-1 text-gray-800">
          <div>
            <h3 className="text-sm font-bold text-gray-700 border-b border-gray-100 pb-2">
              Adición detalle de DTE
            </h3>
          </div>

          {errorValidacion && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
              {errorValidacion}
            </div>
          )}

          {/* FILA 1: TIPO DE ÍTEM (CAT-011) */}
          <div className="flex items-center gap-4">
            <label className="text-xs font-medium text-gray-700 w-16">Tipo:</label>
            <div className="w-64">
              <select
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
                value={tipoItem}
                onChange={(e) => setTipoItem(e.target.value)}
              >
                {CAT_TIPOITEM.slice(0, 3).map((t) => (
                  <option key={t.codigo} value={t.codigo}>
                    {t.codigo} - {t.codigo === "1" ? "Bien" : t.codigo === "2" ? "Servicio" : "Bien y servicio"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* FILA 2: CAMPOS PRINCIPALES DEL PRODUCTO (Cantidad, Unidad, Código, Producto, Tipo Venta, Precio) */}
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
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
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

            {/* Código (Opcional) */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Código</label>
              <input
                type="text"
                placeholder="Código"
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
            </div>

            {/* Producto / Descripción */}
            <div className="space-y-1 md:col-span-1">
              <label className="text-xs font-medium text-gray-700">Producto</label>
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

            {/* Precio */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Precio</label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="Precio"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
              />
            </div>
          </div>

          {/* FILA 3: INFORMACIÓN DE LOS TRIBUTOS Y TOTALES */}
          <div className="pt-2 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* LADO IZQUIERDO: SELECTORES DE TRIBUTOS */}
            <div className="md:col-span-7 space-y-3">
              <p className="text-xs font-bold text-gray-700">Información de los tributos</p>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Dropdown Impuesto */}
                <div className="relative" ref={menuTributosRef}>
                  <button
                    type="button"
                    onClick={() => setMenuTributosOpen(!menuTributosOpen)}
                    className="inline-flex items-center gap-1 px-4 py-1.5 bg-[#0088FF] hover:bg-blue-600 text-white rounded-md text-xs font-semibold shadow-sm transition"
                  >
                    Impuesto <ChevronDownIcon className="w-3.5 h-3.5 ml-1" />
                  </button>

                  {menuTributosOpen && (
                    <div className="absolute left-0 mt-1 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-20 p-2 max-h-60 overflow-y-auto space-y-1">
                      {listaTributos1.map((t) => (
                        <label
                          key={t.codigo}
                          className="flex items-start gap-2 p-1.5 hover:bg-blue-50 rounded-lg text-xs cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                            checked={tributos.includes(t.codigo)}
                            onChange={() => toggleTributo(t.codigo)}
                          />
                          <span className="text-gray-700 leading-tight">
                            {t.codigo} - {t.descripcion}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dropdown Impuestos Informativos */}
                <div className="relative" ref={menuInfoRef}>
                  <button
                    type="button"
                    onClick={() => setMenuInfoOpen(!menuInfoOpen)}
                    className="inline-flex items-center gap-1 px-4 py-1.5 bg-[#0088FF] hover:bg-blue-600 text-white rounded-md text-xs font-semibold shadow-sm transition"
                  >
                    Impuestos Informativos <ChevronDownIcon className="w-3.5 h-3.5 ml-1" />
                  </button>

                  {menuInfoOpen && (
                    <div className="absolute left-0 mt-1 w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-20 p-2 max-h-60 overflow-y-auto space-y-1">
                      {listaTributos3.map((t) => (
                        <label
                          key={t.codigo}
                          className="flex items-start gap-2 p-1.5 hover:bg-blue-50 rounded-lg text-xs cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                            checked={tributosInfo.includes(t.codigo)}
                            onChange={() => toggleTributoInfo(t.codigo)}
                          />
                          <span className="text-gray-700 leading-tight">
                            {t.codigo} - {t.descripcion}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Etiquetas / Chips de tributos seleccionados */}
              <div className="pt-2 flex flex-wrap gap-1.5">
                {tributos.map((cod) => {
                  const tObj = listaTributos1.find((x) => x.codigo === cod);
                  return (
                    <span
                      key={cod}
                      className="text-xs font-bold text-gray-800 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded"
                    >
                      [{cod} - {tObj ? tObj.descripcion : "Tributo"}]
                    </span>
                  );
                })}
                {tributosInfo.map((cod) => {
                  const tObj = listaTributos3.find((x) => x.codigo === cod);
                  return (
                    <span
                      key={cod}
                      className="text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded"
                    >
                      [{cod} - {tObj ? tObj.descripcion : "Informativo"}]
                    </span>
                  );
                })}
              </div>
            </div>

            {/* LADO DERECHO: DESCUENTO Y TOTAL */}
            <div className="md:col-span-5 flex flex-col sm:flex-row gap-4 justify-end">
              <div className="space-y-1 w-full sm:w-36">
                <label className="text-xs font-medium text-gray-700">Descuento</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Descuento"
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500/30 outline-none"
                  value={descuento}
                  onChange={(e) => setDescuento(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-1 w-full sm:w-36">
                <label className="text-xs font-medium text-gray-700">Total</label>
                <input
                  type="text"
                  readOnly
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 outline-none cursor-default"
                  value={`$${totalCalculado.toFixed(2)}`}
                />
              </div>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN INFERIORES */}
          <div className="pt-6 border-t border-gray-100 flex items-center gap-3">
            <button
              type="submit"
              className="px-5 py-2 bg-[#0088FF] hover:bg-blue-600 text-white rounded-lg text-xs font-bold shadow-md transition-all transform active:scale-95"
            >
              Agregar Ítem
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-transparent hover:bg-blue-50 border border-[#0088FF] text-[#0088FF] rounded-lg text-xs font-bold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
