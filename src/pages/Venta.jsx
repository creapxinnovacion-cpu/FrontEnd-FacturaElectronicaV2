import { useState, useEffect } from "react";
import SelectorUbicacion from "../components/SelectorUbicacion";
import ModalItemDte from "../components/ModalItemDte";
import { batchService } from "../services/api/batch.service";
import { clienteService } from "../services/api/cliente.service";
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
  ChevronDownIcon,
  MagnifyingGlassIcon,
  BookmarkSquareIcon,
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

  // --- BÚSQUEDA Y VINCULACIÓN DE CLIENTES ---
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [resultadosClientes, setResultadosClientes] = useState([]);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [guardarCliente, setGuardarCliente] = useState(true);
  const [guardandoClienteManual, setGuardandoClienteManual] = useState(false);
  const [mensajeClienteGuardado, setMensajeClienteGuardado] = useState(null);

  useEffect(() => {
    if (!busquedaCliente || busquedaCliente.trim().length < 2) {
      setResultadosClientes([]);
      setBuscandoCliente(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setBuscandoCliente(true);
        const res = await clienteService.buscar(busquedaCliente.trim());
        setResultadosClientes(res.data || []);
      } catch (err) {
        console.error("Error al buscar clientes:", err);
        setResultadosClientes([]);
      } finally {
        setBuscandoCliente(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [busquedaCliente]);

  const handleSeleccionarCliente = (c) => {
    setClienteSeleccionado(c);
    setBusquedaCliente(c.nombre || "");
    setResultadosClientes([]);

    let tDoc = "36";
    let nDoc = "";
    if (c.dui && c.dui.trim()) {
      tDoc = "13";
      nDoc = c.dui.trim();
    } else if (c.nit && c.nit.trim()) {
      tDoc = "36";
      nDoc = c.nit.trim();
    }

    setReceptor(prev => ({
      ...prev,
      tipoDoc: tDoc,
      numDoc: nDoc,
      nombre: c.nombre || "",
      nombreComercial: c.nombre_comercial || "",
      nrc: c.nrc || "",
      codActividad: c.cod_actividad || "",
      actividadEconomica: c.desc_actividad || "",
      departamento: c.departamento ? String(c.departamento).padStart(2, '0') : "06",
      municipio: c.municipio ? String(c.municipio).padStart(2, '0') : "23",
      distrito: c.distrito ? String(c.distrito).padStart(2, '0') : "01",
      complemento: c.complemento || c.direccion || "",
      correo: c.correo || "",
      telefono: c.telefono || ""
    }));
  };

  const handleLimpiarCliente = () => {
    setClienteSeleccionado(null);
    setBusquedaCliente("");
    setResultadosClientes([]);
    setReceptor(prev => ({
      ...prev,
      numDoc: "",
      nombre: "",
      nombreComercial: "",
      nrc: "",
      codActividad: "",
      actividadEconomica: "",
      complemento: "",
      correo: "",
      telefono: ""
    }));
  };

  const handleGuardarClienteManual = async () => {
    if (!receptor.nombre || !receptor.nombre.trim()) {
      alert("Ingrese al menos el nombre del cliente para guardarlo.");
      return;
    }

    setGuardandoClienteManual(true);
    setMensajeClienteGuardado(null);
    try {
      const cleanDoc = (receptor.numDoc || "").replace(/[^0-9]/g, "");
      const isDui = receptor.tipoDoc === "13" || cleanDoc.length === 9;
      const isNit = receptor.tipoDoc === "36" || cleanDoc.length === 14;

      const payload = {
        nombre: receptor.nombre.trim(),
        nombre_comercial: receptor.nombreComercial ? receptor.nombreComercial.trim() : null,
        dui: isDui ? cleanDoc : null,
        nit: isNit ? cleanDoc : null,
        nrc: receptor.nrc ? receptor.nrc.trim() : null,
        cod_actividad: receptor.codActividad || null,
        desc_actividad: receptor.actividadEconomica || null,
        correo: receptor.correo ? receptor.correo.trim() : null,
        telefono: receptor.telefono ? receptor.telefono.trim() : null,
        direccion: receptor.complemento ? receptor.complemento.trim() : "San Salvador",
        departamento: receptor.departamento || "06",
        municipio: receptor.municipio || "23",
        distrito: receptor.distrito || "01",
        complemento: receptor.complemento ? receptor.complemento.trim() : null,
      };

      const res = await clienteService.guardar(payload);
      setClienteSeleccionado(res.data.cliente);
      setMensajeClienteGuardado("✓ Cliente guardado con éxito en la base de datos");
      setTimeout(() => setMensajeClienteGuardado(null), 4000);
    } catch (err) {
      alert("Error al guardar cliente: " + (err.response?.data?.message || err.response?.data?.error || err.message));
    } finally {
      setGuardandoClienteManual(false);
    }
  };

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
  const [retencionIva, _setRetencionIva] = useState(0);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        guardar_cliente: guardarCliente,
        receptor_nombre: receptor.nombre || "Consumidor Final",
        receptor_nombre_comercial: receptor.nombreComercial || null,
        receptor_documento: receptor.numDoc || null,
        receptor_nrc: receptor.nrc || null,
        receptor_cod_actividad: receptor.codActividad || null,
        receptor_desc_actividad: receptor.actividadEconomica || null,
        receptor_correo: receptor.correo || null,
        receptor_telefono: receptor.telefono || null,
        receptor_direccion: receptor.complemento || "San Salvador",
        receptor_departamento: receptor.departamento || "06",
        receptor_municipio: receptor.municipio || "23",
        receptor_distrito: receptor.distrito || "01",
        receptor_complemento: receptor.complemento || "Sin complemento",
        items: items.map(it => ({
          producto_id: it.producto_id || null,
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
    <div className="min-h-screen bg-slate-50/60 pb-16">
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
      <div className="bg-white border-b border-slate-200/80 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/60">
                  DTE-01
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Ministerio de Hacienda de El Salvador
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <DocumentTextIcon className="w-7 h-7 text-blue-600" />
                Factura Electrónica
              </h1>
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>
                  Emisor: <strong className="text-slate-800">{emisor.nombre}</strong>
                </span>
                <span>•</span>
                <span>
                  NRC: <strong className="text-slate-800 font-mono-code">{emisor.nrc}</strong>
                </span>
                <span>•</span>
                <span>
                  Fecha: <strong className="text-slate-800">{emisor.fecha}</strong>
                </span>
                <span>•</span>
                <span>
                  Hora: <strong className="text-slate-800 font-mono-code">{emisor.hora}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleEmitirVenta}
                disabled={loadingEmitir}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm shadow-blue-600/20 transition-all cursor-pointer active:scale-95"
              >
                {loadingEmitir ? "Emitiendo a Hacienda..." : "Generar Documento"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FEEDBACK BANNERS */}
      {emisionResultado && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
            <div className="flex items-start sm:items-center gap-3.5">
              <CheckCircleIcon className="w-7 h-7 text-emerald-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <p className="font-bold text-sm text-emerald-950">
                  Factura Electrónica Emitida y Transmitida Exitosamente
                </p>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Código de Generación:{" "}
                  <span className="font-mono-code font-bold text-emerald-950">
                    {emisionResultado.dte?.codigo_generacion || emisionResultado.codigo_generacion}
                  </span>
                </p>
                <p className="text-xs text-emerald-800">
                  Sello MH:{" "}
                  <span className="font-mono-code text-emerald-900">
                    {emisionResultado.dte?.sello_recepcion || emisionResultado.transmission?.sello || "Otorgado"}
                  </span>
                </p>
              </div>
            </div>
            <span className="self-start sm:self-center text-xs bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              {emisionResultado.dte?.estado_actual || "ACEPTADO"}
            </span>
          </div>
        </div>
      )}

      {emisionError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="bg-rose-50 border border-rose-300 text-rose-900 p-5 rounded-2xl flex items-start gap-3.5 shadow-xs">
            <XCircleIcon className="w-7 h-7 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-rose-950">
                Aviso / Evento durante la Transmisión
              </p>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">{emisionError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLUMNA IZQUIERDA (FORMULARIOS PRINCIPALES) */}
        <div className="lg:col-span-8 space-y-6">

          {/* SECCIÓN RECEPTOR (ALINEADA AL SISTEMA GRATUITO MH) */}
          <section className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
            <div className="bg-slate-50/70 px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserIcon className="w-5 h-5 text-slate-500" />
                <h2 className="text-sm font-bold text-slate-800 tracking-tight">
                  Datos del Receptor (Cliente)
                </h2>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Autocompletado & Agenda</span>
            </div>

            {/* BARRA DE BÚSQUEDA Y GESTIÓN DE CLIENTES */}
            <div className="px-6 pt-5 pb-4 border-b border-slate-200/80 bg-slate-50/40">
              <div className="relative">
                <div className="flex items-center gap-2.5 bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 shadow-xs focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                  <MagnifyingGlassIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Buscar cliente registrado por DUI, NIT, NRC, Teléfono o Nombre..."
                    className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                    value={busquedaCliente}
                    onChange={(e) => setBusquedaCliente(e.target.value)}
                  />
                  {buscandoCliente && (
                    <span className="text-xs text-blue-600 font-semibold animate-pulse flex-shrink-0">
                      Buscando...
                    </span>
                  )}
                  {busquedaCliente && (
                    <button
                      type="button"
                      onClick={handleLimpiarCliente}
                      className="text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5 rounded cursor-pointer"
                      title="Limpiar búsqueda"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* DROPDOWN DE RESULTADOS */}
                {resultadosClientes.length > 0 && (
                  <div className="absolute z-30 left-0 right-0 mt-1.5 bg-white border border-blue-200 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {resultadosClientes.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleSeleccionarCliente(c)}
                        className="p-3.5 hover:bg-blue-50/80 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900">{c.nombre}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {[
                              c.dui ? `DUI: ${c.dui}` : null,
                              c.nit ? `NIT: ${c.nit}` : null,
                              c.nrc ? `NRC: ${c.nrc}` : null,
                              c.telefono ? `Tel: ${c.telefono}` : null,
                              c.correo,
                            ]
                              .filter(Boolean)
                              .join(" • ")}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg">
                          Cargar Datos
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* BARRA DE ACCIÓN Y CHECKBOX DE GUARDADO */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                {clienteSeleccionado ? (
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-medium">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                    <span>
                      Cliente vinculado: <strong>{clienteSeleccionado.nombre}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleLimpiarCliente}
                      className="text-rose-600 hover:underline ml-1 font-bold cursor-pointer"
                    >
                      Desvincular
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Escriba en el buscador para autocompletar o ingrese los datos manualmente.
                  </span>
                )}

                <div className="flex items-center gap-3 ml-auto">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={guardarCliente}
                      onChange={(e) => setGuardarCliente(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      Guardar / actualizar en la tabla clientes
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={handleGuardarClienteManual}
                    disabled={guardandoClienteManual}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Guardar o actualizar la ficha de este cliente en la base de datos ahora"
                  >
                    <BookmarkSquareIcon className="w-3.5 h-3.5 text-slate-600" />
                    {guardandoClienteManual ? "Guardando..." : "Guardar Cliente"}
                  </button>
                </div>
              </div>

              {mensajeClienteGuardado && (
                <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium">
                  {mensajeClienteGuardado}
                </div>
              )}
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Columna Izquierda Receptor */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 ml-0.5">
                    Tipo de Documento (CAT-022)
                  </label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
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
                  <label className="text-xs font-semibold text-slate-600 ml-0.5">
                    Número de Documento / NIT
                  </label>
                  <input
                    type="text"
                    placeholder="Digite número de documento..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono-code focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={receptor.numDoc}
                    onChange={(e) => setReceptor({ ...receptor, numDoc: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 ml-0.5">
                    Nombre del Cliente / Razón Social <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre completo o razón social..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={receptor.nombre}
                    onChange={(e) => setReceptor({ ...receptor, nombre: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 ml-0.5">NRC</label>
                    <input
                      type="text"
                      placeholder="N° Registro"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono-code focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      value={receptor.nrc}
                      onChange={(e) => setReceptor({ ...receptor, nrc: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 ml-0.5">Nombre Comercial</label>
                    <input
                      type="text"
                      placeholder="Nombre comercial"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      value={receptor.nombreComercial}
                      onChange={(e) => setReceptor({ ...receptor, nombreComercial: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 ml-0.5">
                    Actividad Económica (CAT-019)
                  </label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
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
                  <label className="text-xs font-semibold text-slate-600 ml-0.5">Dirección Complemento</label>
                  <textarea
                    placeholder="Detalle de dirección (colonia, calle, pasaje, n° de casa)..."
                    rows="2"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                    value={receptor.complemento}
                    onChange={(e) => setReceptor({ ...receptor, complemento: e.target.value })}
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 ml-0.5">Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="cliente@correo.com"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      value={receptor.correo}
                      onChange={(e) => setReceptor({ ...receptor, correo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 ml-0.5">Teléfono</label>
                    <input
                      type="text"
                      placeholder="7000-0000"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono-code focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      value={receptor.telefono}
                      onChange={(e) => setReceptor({ ...receptor, telefono: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN DETALLE DE FACTURA / ÍTEMS */}
          <section className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
            <div className="bg-slate-50/70 px-6 py-4 border-b border-slate-200/80 flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-2.5">
                <ShoppingCartIcon className="w-5 h-5 text-slate-500" />
                <div>
                  <h2 className="text-sm font-bold text-slate-800 tracking-tight">
                    Cuerpo del Documento (Detalle de Ítems)
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAbrirModalNuevo}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <PlusIcon className="w-4 h-4" /> Agregar Ítem
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-200/80 bg-slate-50/50">
                    <th className="py-3 px-5 font-bold">Tipo</th>
                    <th className="py-3 px-4 font-bold">Descripción</th>
                    <th className="py-3 px-4 font-bold w-16 text-center">Cant.</th>
                    <th className="py-3 px-4 font-bold w-24 text-center">Unidad</th>
                    <th className="py-3 px-4 font-bold w-24 text-right">Precio</th>
                    <th className="py-3 px-4 font-bold w-24 text-center">Venta</th>
                    <th className="py-3 px-4 font-bold w-28 text-right">Sub Total</th>
                    <th className="py-3 px-5 w-20 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-sm text-slate-400">
                        No hay ítems agregados a esta factura.
                        <button
                          type="button"
                          onClick={handleAbrirModalNuevo}
                          className="text-blue-600 font-semibold ml-1 hover:underline cursor-pointer"
                        >
                          Haga clic aquí para añadir un producto o servicio.
                        </button>
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              item.tipoItem === "2"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : item.tipoItem === "3"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {item.tipoItem === "2" ? "Servicio" : item.tipoItem === "3" ? "Ambos" : "Bien"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-sm font-semibold text-slate-800">{item.descripcion}</p>
                          {item.codigo && (
                            <p className="text-[11px] text-slate-400 font-mono-code">Cód: {item.codigo}</p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center text-sm font-semibold text-slate-700 tabular-nums">
                          {item.cantidad}
                        </td>
                        <td className="py-3.5 px-4 text-center text-xs text-slate-500">
                          {item.unidadMedidaDesc || "Unidad"}
                        </td>
                        <td className="py-3.5 px-4 text-right text-sm font-medium text-slate-700 font-mono-code tabular-nums">
                          ${parseFloat(item.precio || 0).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            {item.tipoVenta}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-sm font-bold text-slate-900 font-mono-code tabular-nums">
                          ${parseFloat(item.total || 0).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleAbrirModalEditar(item)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Editar ítem"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEliminarItem(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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

          {/* SECCIÓN CONDICIÓN, FORMAS DE PAGO Y OBSERVACIONES */}
          <section className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 space-y-6">
            <div className="flex items-center gap-2.5">
              <CreditCardIcon className="w-5 h-5 text-slate-500" />
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">
                Condición de la Operación y Formas de Pago
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Condición de la Operación (CAT-016) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 ml-0.5">
                  Condición de la operación (CAT-016)
                </label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
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
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 ml-0.5">
                  Añadir Pago (CAT-017)
                </label>
                <div className="flex gap-2">
                  <select
                    className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
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
                    placeholder="Monto $"
                    className="w-28 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-mono-code focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={pago.montoNuevo}
                    onChange={(e) => setPago({ ...pago, montoNuevo: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={handleAgregarPago}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <PlusIcon className="w-3.5 h-3.5" /> Pago
                  </button>
                </div>
              </div>
            </div>

            {/* Tabla de Pagos Agregados */}
            <div className="border border-slate-200/80 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Forma de Pago Registrada</th>
                    <th className="py-2.5 px-4 text-right">Monto</th>
                    <th className="py-2.5 px-4 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pago.listaPagos.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4 font-medium text-slate-800">{p.formaPago}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900 font-mono-code tabular-nums">
                        ${p.monto.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {pago.listaPagos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleEliminarPago(p.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Eliminar forma de pago"
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
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-slate-600 ml-0.5">
                Observaciones al Documento
              </label>
              <textarea
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                rows="2"
                placeholder="Notas u observaciones adicionales que viajarán en el JSON del DTE..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              ></textarea>
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA (RESUMEN FINANCIERO MH) */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-5">
            <section className="bg-slate-900 text-white rounded-2xl shadow-xl p-6 border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                  Resumen de Operación
                </h2>
                <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  USD ($)
                </span>
              </div>

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Total Gravado:</span>
                  <span className="font-semibold text-slate-200 font-mono-code tabular-nums">
                    ${totalGravado.toFixed(2)}
                  </span>
                </div>

                {totalExento > 0 && (
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Total Exento:</span>
                    <span className="font-semibold text-slate-200 font-mono-code tabular-nums">
                      ${totalExento.toFixed(2)}
                    </span>
                  </div>
                )}

                {totalNoSujeto > 0 && (
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Total No Sujeto:</span>
                    <span className="font-semibold text-slate-200 font-mono-code tabular-nums">
                      ${totalNoSujeto.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-slate-400">
                  <span>Sub Total:</span>
                  <span className="font-semibold text-slate-200 font-mono-code tabular-nums">
                    ${subTotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-400">
                  <span>Retención IVA:</span>
                  <span className="font-semibold text-slate-200 font-mono-code tabular-nums">
                    $0.00
                  </span>
                </div>

                <div className="border-t border-slate-800 pt-5 mt-4 space-y-1.5">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider text-center">
                    Total a Pagar
                  </p>
                  <div className="flex justify-center items-baseline gap-1">
                    <span className="text-2xl font-light text-blue-400 font-mono-code">$</span>
                    <span className="text-4xl font-extrabold text-white tracking-tight font-mono-code tabular-nums">
                      {totalPagar.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleEmitirVenta}
                  disabled={loadingEmitir}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <CreditCardIcon className="w-4 h-4" />
                  {loadingEmitir ? "Emitiendo a Hacienda..." : "Generar y Transmitir"}
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-3 leading-relaxed">
                  Generación con firma digital conforme al esquema DTE v2 del Ministerio de Hacienda.
                </p>
              </div>
            </section>

            {/* CARD INFORMATIVA MH */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-1.5">
                <InformationCircleIcon className="w-4 h-4 text-blue-600" /> Cumplimiento Normativo
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Los datos son catalogados según las tablas oficiales (CAT-011 Tipo de ítem, CAT-014 Unidad de medida, CAT-015 Tributos y CAT-017 Formas de pago).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
