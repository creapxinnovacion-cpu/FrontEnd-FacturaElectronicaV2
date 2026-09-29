import { useState, useEffect } from "react";
import SelectorUbicacion from "../components/SelectorUbicacion";
import ModalItemDte from "../components/ModalItemDte";
import { batchService } from "../services/api/batch.service";
import { db } from "../services/db";
import { CAT_ACTIVIDAD_ECONOMICA } from "../utils/catalogos/catActividadesEconomicas";
import { CAT_TIPO_DOCUMENTO_IDENTIFICACION } from "../utils/catalogos/CatTipoDocumentoIdentificacion";
import { CAT_CONDICION_PAGO } from "../utils/catalogos/catCondicionPago";
import { CAT_FORMA_PAGOS } from "../utils/catalogos/catFormaPagos";
import {
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  UserIcon,
  MapPinIcon,
  CreditCardIcon,
  InformationCircleIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";

export default function Venta() {
  const [loadingEmitir, setLoadingEmitir] = useState(false);
  const [emisionResultado, setEmisionResultado] = useState(null);
  const [emisionError, setEmisionError] = useState(null);

  // --- MODAL ÍTEM DTE ---
  const [modalItemOpen, setModalItemOpen] = useState(false);
  const [itemParaEditar, setItemParaEditar] = useState(null);

  // --- ESTADO DE ITEMS ---
  const [items, setItems] = useState([
    {
      id: 1,
      tipoItem: "1",
      cantidad: 1,
      unidadMedida: "59",
      unidadMedidaDesc: "Unidad",
      codigo: "PROD-001",
      descripcion: "Producto o Servicio Ejemplo",
      tipoVenta: "Gravado",
      precio: 10.00,
      descuento: 0,
      total: 10.00,
      tributos: ["20"],
      tributosInfo: []
    }
  ]);

  // --- DATOS DEL EMISOR ---
  const [emisor, setEmisor] = useState({
    nit: "03151312971037",
    nrc: "3400370",
    nombre: "CRISTIAN ALEJANDRO CAJUL BLANCO",
    actividad: "96092 - Servicios n.c.p.",
    direccion: "IZALCO, CTON. HUISCOYOLATE CRIO. EL CEGA",
    correo: "chrishalej997@gmail.com",
    telefono: "7448-4708",
    tipoDte: "Factura",
    fecha: new Date().toLocaleDateString('es-SV'),
    hora: new Date().toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  });

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setEmisor(prev => ({
        ...prev,
        fecha: new Date().toLocaleDateString('es-SV'),
        hora: new Date().toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- DATOS DEL RECEPTOR (Alineado estrictamente a capturas MH) ---
  const [receptor, setReceptor] = useState({
    tipoDoc: "36", // NIT por defecto
    numDoc: "",
    nombre: "",
    nrc: "",
    nombreComercial: "",
    codActividad: "",
    actividadEconomica: "",
    departamento: "06",
    municipio: "23",
    distrito: "01",
    complemento: "",
    correo: "",
    telefono: ""
  });

  // --- CONDICIÓN Y FORMAS DE PAGO (Alineado a captura 001902 y 002628) ---
  const [pago, setPago] = useState({
    condicion: "Contado",
    formaSeleccionada: "Billetes y monedas",
    montoNuevo: "",
    numDocPago: "",
    listaPagos: [
      { id: 1, formaPago: "Billetes y monedas", monto: 10.00, numDoc: "" }
    ]
  });

  const [observaciones, setObservaciones] = useState("");
  const [retencionIva, setRetencionIva] = useState(0);

  // --- OPERACIONES Y TOTALES ---
  const totalGravado = items.filter(it => it.tipoVenta === "Gravado").reduce((acc, it) => acc + it.total, 0);
  const totalExento = items.filter(it => it.tipoVenta === "Exento").reduce((acc, it) => acc + it.total, 0);
  const totalNoSujeto = items.filter(it => it.tipoVenta === "No sujeto").reduce((acc, it) => acc + it.total, 0);
  const subTotal = items.reduce((acc, item) => acc + item.total, 0);
  const totalPagar = Math.max(0, subTotal - retencionIva);

  // Sincronizar monto del pago si solo hay uno
  useEffect(() => {
    if (pago.listaPagos.length === 1 && pago.listaPagos[0].monto !== totalPagar) {
      setPago(prev => ({
        ...prev,
        listaPagos: [{ ...prev.listaPagos[0], monto: totalPagar }]
      }));
    }
  }, [totalPagar]);

  // Manejo de Ítems
  const handleAbrirModalNuevo = () => {
    setItemParaEditar(null);
    setModalItemOpen(true);
  };

  const handleAbrirModalEditar = (item) => {
    setItemParaEditar(item);
    setModalItemOpen(true);
  };

  const handleGuardarItem = (itemGuardado) => {
    if (itemParaEditar) {
      setItems(items.map(it => it.id === itemGuardado.id ? itemGuardado : it));
    } else {
      setItems([...items, itemGuardado]);
    }
    setItemParaEditar(null);
  };

  const handleEliminarItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Manejo de Pagos
  const handleAgregarPago = () => {
    const monto = parseFloat(pago.montoNuevo);
    if (!monto || monto <= 0) return;

    setPago(prev => ({
      ...prev,
      listaPagos: [
        ...prev.listaPagos,
        {
          id: Date.now(),
          formaPago: prev.formaSeleccionada,
          monto: parseFloat(monto.toFixed(2)),
          numDoc: prev.numDocPago.trim()
        }
      ],
      montoNuevo: "",
      numDocPago: ""
    }));
  };

  const handleEliminarPago = (id) => {
    setPago(prev => ({
      ...prev,
      listaPagos: prev.listaPagos.filter(p => p.id !== id)
    }));
  };

  // Emisión DTE
  const handleEmitirVenta = async () => {
    setLoadingEmitir(true);
    setEmisionError(null);
    setEmisionResultado(null);
    let payload = null;
    try {
      if (items.length === 0) {
        throw new Error("Debe agregar al menos un producto o servicio antes de emitir.");
      }

      payload = {
        emisor_id: 1,
        tipo_dte: 1, // Factura
        receptor_nombre: receptor.nombre || "Consumidor Final",
        receptor_documento: receptor.numDoc || null,
        receptor_correo: receptor.correo || null,
        receptor_telefono: receptor.telefono || null,
        receptor_direccion: receptor.complemento || "San Salvador",
        receptor_departamento: receptor.departamento || "06",
        receptor_municipio: receptor.municipio || "23",
        receptor_distrito: receptor.distrito || "01",
        receptor_complemento: receptor.complemento || "Sin complemento",
        items: items.map(it => ({
          tipo_item: parseInt(it.tipoItem || "1"),
          codigo: it.codigo || null,
          descripcion: it.descripcion || "Producto/Servicio",
          cantidad: parseFloat(it.cantidad) || 1,
          unidad_medida: it.unidadMedida || "59",
          precio: parseFloat(it.precio) || 0,
          tipo_venta: it.tipoVenta || "Gravado",
          descuento: parseFloat(it.descuento) || 0,
          total: parseFloat(it.total) || 0,
          tributos: it.tributos || ["20"]
        })),
        pagos: pago.listaPagos.map(p => ({
          forma_pago: p.formaPago,
          monto: p.monto,
          num_doc: p.numDoc || null
        })),
        condicion_operacion: pago.condicion,
        observaciones: observaciones || null,
        total_pagar: parseFloat(totalPagar.toFixed(2)),
      };

      const res = await batchService.create(payload);
      setEmisionResultado(res.data);
    } catch (err) {
      // Detección de Caída Nivel 1 o Fallo Crítico del Servidor (500+)
      const isNetworkError = !err.response || err.code === 'ERR_NETWORK';
      const isServerError = err.response && err.response.status >= 500;

      if (isNetworkError || isServerError) {
        // ID único para idempotencia
        const offlineId = crypto.randomUUID ? crypto.randomUUID() : `OFF-${Date.now()}`;
        
        const newOfflineDoc = { 
          id: offlineId,
          payloadOriginal: payload,
          estado: 'Borrador Offline', 
          fecha: new Date().toISOString(),
          retries: 0,
          receptor_nombre: payload.receptor_nombre
        };
        
        // Guardar en IndexedDB usando Dexie
        await db.offlineDocs.add(newOfflineDoc);
        
        setEmisionError(`⚠️ Problema de conexión (${isServerError ? 'Servidor Interno Caído' : 'Sin Internet'}). El documento se guardó localmente (ID: ${offlineId}) y está en la cola de sincronización.`);
      } else {
        // Errores de validación 4xx o rechazos de negocio sí se muestran
        setEmisionError(err.response?.data?.error || err.message || "Error al emitir Factura ante Ministerio de Hacienda");
      }
    } finally {
      setLoadingEmitir(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* MODAL ÍTEM DTE OFICIAL MH */}
      <ModalItemDte
        isOpen={modalItemOpen}
        onClose={() => {
          setModalItemOpen(false);
          setItemParaEditar(null);
        }}
        onSave={handleGuardarItem}
        initialData={itemParaEditar}
      />

      {/* HEADER SECTION */}
      <div className="bg-[#1A2B3C] text-white pt-8 pb-16 px-6 mb-[-4rem]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <DocumentTextIcon className="w-8 h-8 text-blue-400" />
              Factura Electrónica
            </h1>
            <p className="text-blue-200 mt-1 opacity-80 flex items-center gap-3 text-xs">
              <span>Fecha DTE: <strong className="text-white">{emisor.fecha}</strong></span>
              <span>•</span>
              <span>Hora: <strong className="text-white">{emisor.hora}</strong></span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleEmitirVenta}
              disabled={loadingEmitir}
              className="px-8 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.02]"
            >
              {loadingEmitir ? "EMITIENDO A HACIENDA..." : "GENERAR DOCUMENTO"}
            </button>
          </div>
        </div>
      </div>

      {/* FEEDBACK BANNERS */}
      {emisionResultado && (
        <div className="max-w-7xl mx-auto px-6 mt-6 mb-2">
          <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 p-5 rounded-2xl flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-7 h-7 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm text-white">Factura Electrónica Emitida y Transmitida Exitosamente</p>
                <p className="text-xs text-emerald-300 mt-0.5">
                  Código de Generación: <span className="font-mono text-white">{emisionResultado.dte?.codigo_generacion || emisionResultado.codigo_generacion}</span>
                </p>
                <p className="text-xs text-emerald-300">
                  Sello MH: <span className="font-mono text-white">{emisionResultado.dte?.sello_recepcion || emisionResultado.transmission?.sello || "Otorgado"}</span>
                </p>
              </div>
            </div>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-full font-bold">
              ESTADO: {emisionResultado.dte?.estado_actual || "ACEPTADO"}
            </span>
          </div>
        </div>
      )}

      {emisionError && (
        <div className="max-w-7xl mx-auto px-6 mt-6 mb-2">
          <div className="bg-rose-950/80 border border-rose-500/40 text-rose-200 p-5 rounded-2xl flex items-center gap-3 shadow-xl">
            <XCircleIcon className="w-7 h-7 text-rose-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm text-white">Error durante la Transmisión al Ministerio de Hacienda</p>
              <p className="text-xs text-rose-300 mt-0.5">{emisionError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* COLUMNA IZQUIERDA (CONTENIDO PRINCIPAL) */}
        <div className="lg:col-span-8 space-y-8">

          {/* SECCIÓN RECEPTOR (ALINEADA AL SISTEMA GRATUITO MH) */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50/50 px-8 py-4 border-b border-gray-100 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-gray-400" />
              <h3 className="font-bold text-gray-700">Datos del Receptor</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna Izquierda Receptor */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Tipo de Documento (CAT-022)</label>
                  <select
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={receptor.tipoDoc}
                    onChange={(e) => setReceptor({ ...receptor, tipoDoc: e.target.value })}
                  >
                    <option value="">-- Seleccione Tipo de Documento --</option>
                    {CAT_TIPO_DOCUMENTO_IDENTIFICACION.map((doc) => (
                      <option key={doc.codigo} value={doc.codigo}>
                        {doc.descripcion} ({doc.codigo})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Número de Documento / NIT</label>
                  <input
                    type="text"
                    placeholder="Digite el número de documento"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={receptor.numDoc}
                    onChange={(e) => setReceptor({ ...receptor, numDoc: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Nombre del Cliente / Razón Social *</label>
                  <input
                    type="text"
                    placeholder="Nombre completo del cliente"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={receptor.nombre}
                    onChange={(e) => setReceptor({ ...receptor, nombre: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 ml-1">NRC</label>
                    <input
                      type="text"
                      placeholder="Número de registro"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                      value={receptor.nrc}
                      onChange={(e) => setReceptor({ ...receptor, nrc: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Nombre Comercial</label>
                    <input
                      type="text"
                      placeholder="Nombre comercial"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                      value={receptor.nombreComercial}
                      onChange={(e) => setReceptor({ ...receptor, nombreComercial: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Actividad Económica (CAT-019)</label>
                  <select
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                    value={receptor.codActividad ? `${receptor.codActividad}||${receptor.actividadEconomica}` : ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        setReceptor({ ...receptor, codActividad: "", actividadEconomica: "" });
                      } else {
                        const [cod, ...desc] = val.split("||");
                        setReceptor({ ...receptor, codActividad: cod, actividadEconomica: desc.join("||") });
                      }
                    }}
                  >
                    <option value="">-- Seleccione Actividad Económica --</option>
                    {CAT_ACTIVIDAD_ECONOMICA.map((act, idx) => (
                      <option key={`${act.codigo}-${idx}`} value={`${act.codigo}||${act.descripcion}`}>
                        {act.codigo} - {act.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Columna Derecha Receptor (Ubicación y Contacto) */}
              <div className="space-y-4">
                <SelectorUbicacion
                  departamento={receptor.departamento}
                  municipio={receptor.municipio}
                  distrito={receptor.distrito}
                  gridCols="grid-cols-1 md:grid-cols-2"
                  onChange={({ departamento, municipio, distrito }) => {
                    setReceptor({ ...receptor, departamento, municipio, distrito });
                  }}
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Dirección Complemento</label>
                  <textarea
                    placeholder="Digite el complemento de la dirección"
                    rows="2"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                    value={receptor.complemento}
                    onChange={(e) => setReceptor({ ...receptor, complemento: e.target.value })}
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                      value={receptor.correo}
                      onChange={(e) => setReceptor({ ...receptor, correo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Teléfono</label>
                    <input
                      type="text"
                      placeholder="7000-0000"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                      value={receptor.telefono}
                      onChange={(e) => setReceptor({ ...receptor, telefono: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN DETALLE DE FACTURA / ÍTEMS (IDÉNTICO A CAPTURA MH) */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50/50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingCartIcon className="w-5 h-5 text-gray-400" />
                <h3 className="font-bold text-gray-700">Datos de la Factura (Detalle de DTE)</h3>
              </div>
              <button
                type="button"
                onClick={handleAbrirModalNuevo}
                className="inline-flex items-center px-4 py-2 bg-[#0088FF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md transition-all transform active:scale-95"
              >
                <PlusIcon className="w-4 h-4 mr-1.5" /> Agregar Detalle ▾
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-gray-400 uppercase tracking-[0.15em] border-b border-gray-50 bg-gray-50/30">
                    <th className="py-4 px-6 font-bold">Tipo</th>
                    <th className="py-4 px-4 font-bold">Descripción</th>
                    <th className="py-4 px-4 font-bold w-20 text-center">Cant.</th>
                    <th className="py-4 px-4 font-bold w-28 text-center">Unidad</th>
                    <th className="py-4 px-4 font-bold w-28 text-right">Precio</th>
                    <th className="py-4 px-4 font-bold w-28 text-center">Tipo Venta</th>
                    <th className="py-4 px-4 font-bold w-28 text-right">Sub Total</th>
                    <th className="py-4 px-6 w-24 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-sm text-gray-400">
                        No hay ítems agregados. Haga clic en <strong className="text-blue-600">"Agregar Detalle"</strong> para añadir productos o servicios.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="group hover:bg-gray-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${item.tipoItem === "2"
                              ? "bg-purple-100 text-purple-700"
                              : item.tipoItem === "3"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-700"
                            }`}>
                            {item.tipoItem === "2" ? "Servicio" : item.tipoItem === "3" ? "Ambos" : "Bien"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm font-bold text-gray-800">{item.descripcion}</p>
                          {item.codigo && (
                            <p className="text-[11px] text-gray-400 font-mono">Cód: {item.codigo}</p>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center text-sm font-semibold text-gray-700">
                          {item.cantidad}
                        </td>
                        <td className="py-4 px-4 text-center text-xs text-gray-600">
                          {item.unidadMedidaDesc || "Unidad"}
                        </td>
                        <td className="py-4 px-4 text-right text-sm font-medium text-gray-700">
                          ${parseFloat(item.precio || 0).toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                            {item.tipoVenta}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right text-sm font-bold text-gray-900">
                          ${parseFloat(item.total || 0).toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleAbrirModalEditar(item)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Editar ítem"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEliminarItem(item.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Eliminar ítem"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECCIÓN CONDICIÓN, FORMAS DE PAGO Y OBSERVACIONES (ALINEADO A MH) */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <CreditCardIcon className="w-5 h-5 text-gray-400" />
              <h3 className="font-bold text-gray-700">Condición de la Operación y Formas de Pago</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Condición de la Operación (CAT-016) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Condición de la operación (CAT-016)</label>
                <select
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                  value={pago.condicion}
                  onChange={(e) => setPago({ ...pago, condicion: e.target.value })}
                >
                  {CAT_CONDICION_PAGO.map((cp) => (
                    <option key={cp.codigo} value={cp.descripcion}>
                      {cp.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              {/* Agregar Pago (CAT-017) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500">Forma de Pago (CAT-017)</label>
                <div className="flex gap-2">
                  <select
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 text-xs outline-none"
                    value={pago.formaSeleccionada}
                    onChange={(e) => setPago({ ...pago, formaSeleccionada: e.target.value })}
                  >
                    {CAT_FORMA_PAGOS.map((fp) => (
                      <option key={fp.codigo} value={fp.descripcion}>
                        {fp.descripcion}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="any"
                    placeholder="Monto Pago"
                    className="w-28 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 text-xs outline-none"
                    value={pago.montoNuevo}
                    onChange={(e) => setPago({ ...pago, montoNuevo: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={handleAgregarPago}
                    className="px-3 py-2 bg-[#0088FF] hover:bg-blue-600 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <PlusIcon className="w-3.5 h-3.5" /> Pago
                  </button>
                </div>
              </div>
            </div>

            {/* Tabla de Pagos Agregados */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Forma de Pago</th>
                    <th className="py-2.5 px-4 text-right">Monto</th>
                    <th className="py-2.5 px-4 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pago.listaPagos.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 px-4 font-medium text-gray-800">{p.formaPago}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-gray-900">${p.monto.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-right">
                        {pago.listaPagos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleEliminarPago(p.id)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Observaciones al documento */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-gray-500">Observaciones al documento</label>
              <textarea
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none resize-none"
                rows="2"
                placeholder="Observaciones adicionales para el DTE..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              ></textarea>
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA (RESUMEN FINANCIERO MH) */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            <section className="bg-[#1A2B3C] text-white rounded-[2.5rem] shadow-2xl p-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                Totales de la Operación
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center text-gray-300">
                  <span>Total Gravado:</span>
                  <span className="font-semibold text-white">${totalGravado.toFixed(2)}</span>
                </div>

                {totalExento > 0 && (
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Total Exento:</span>
                    <span className="font-semibold text-white">${totalExento.toFixed(2)}</span>
                  </div>
                )}

                {totalNoSujeto > 0 && (
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Total No Sujeto:</span>
                    <span className="font-semibold text-white">${totalNoSujeto.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-gray-300">
                  <span>Sub Total:</span>
                  <span className="font-semibold text-white">${subTotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-gray-300">
                  <span>Retención IVA:</span>
                  <span className="font-semibold text-white">$0.00</span>
                </div>

                <div className="border-t border-white/10 pt-6 space-y-2">
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest text-center mb-2">Total a Pagar</p>
                  <div className="flex justify-center items-baseline gap-1">
                    <span className="text-2xl font-light text-blue-400">$</span>
                    <span className="text-4xl font-black text-white tracking-tighter">
                      {totalPagar.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={handleEmitirVenta}
                  disabled={loadingEmitir}
                  className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <CreditCardIcon className="w-5 h-5" />
                  {loadingEmitir ? "EMITIENDO A HACIENDA..." : "GENERAR DOCUMENTO"}
                </button>
                <p className="text-[10px] text-gray-400 text-center mt-3 px-2 leading-relaxed">
                  Documento tributario electrónico firmado digitalmente bajo normativa del Ministerio de Hacienda.
                </p>
              </div>
            </section>

            {/* CARD INFORMATIVA MH */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6">
              <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-2">
                <InformationCircleIcon className="w-4 h-4" /> Normativa de Hacienda
              </h4>
              <p className="text-xs text-blue-700/80 leading-relaxed">
                Los ítems agregados cuentan con la estructura oficial del Ministerio de Hacienda (CAT-011 Tipo de ítem, CAT-014 Unidad de medida y CAT-015 Tributos).
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
