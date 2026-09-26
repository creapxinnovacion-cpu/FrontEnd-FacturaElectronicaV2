import { useState, useEffect } from "react";
import SelectorUbicacion from "./SelectorUbicacion";
import { batchService } from "../services/api/batch.service";
import { CAT_ACTIVIDAD_ECONOMICA } from "../utils/catalogos/catActividadesEconomicas";
import { CAT_TIPO_DOCUMENTO_IDENTIFICACION } from "../utils/catalogos/CatTipoDocumentoIdentificacion";
import { CAT_TIPO_PERSONA } from "../utils/catalogos/CatTipoPersona";
import { DOMICILIO_FISCAL } from "../utils/catalogos/CatDomicilioFiscal";
import { CAT_DOCUMENTOS_ASOCIADO } from "../utils/catalogos/CatDocumentosAsociado";
import { CAT_TITULO_REMITEN_BIENES } from "../utils/catalogos/CatTituloRemitenBienes";
import { CAT_TRASPORTE } from "../utils/catalogos/CatTrasporte";
import { CAT_RECINTO_FISCAL } from "../utils/catalogos/CatRecintoFiscal";
import { CAT_TIPO_DONACION } from "../utils/catalogos/CatTipoDonacion";
import { CAT_DOCUMENTO } from "../utils/catalogos/catTipoDocumento";
import { CAT_GeneracionDocs } from "../utils/catalogos/catGeneracionDocumentos";
import { CAT_UNIDAD_MEDIDA } from "../utils/catalogos/catUnidadMedida";
import { CAT_CONDICION_PAGO } from "../utils/catalogos/catCondicionPago";
import { CAT_FORMA_PAGOS } from "../utils/catalogos/catFormaPagos";
import {
  sanitizarSoloNumeros,
  prevenirNoNumerico,
  validarDUI,
  validarNRC,
  validarNIT,
} from "../utils/validacionesMH";

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
  ShieldCheckIcon,
  TruckIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import ModalItemDte from "./ModalItemDte";

export default function DteForm({ defaultTipoDte }) {
  const [loadingEmitir, setLoadingEmitir] = useState(false);
  const [emisionResultado, setEmisionResultado] = useState(null);
  const [emisionError, setEmisionError] = useState(null);

  // --- MODAL ÍTEM DTE OFICIAL MH ---
  const [modalItemOpen, setModalItemOpen] = useState(false);
  const [itemParaEditar, setItemParaEditar] = useState(null);

  // --- STATE ---
  const createEmptyItem = (id = Date.now()) => ({
    id,
    unidadMedida: "59", // CAT-014 Unidad por defecto
    descripcion: "",
    cantidad: 1,
    precio: 0,
    total: 0,
    subTotalNoSujeto: 0,
    subTotalExento: 0,
    subTotalGravado: 0,
    descuento: 0,
    ventas: 0,
  });

  const [items, setItems] = useState([
    { ...createEmptyItem(1), descripcion: "Producto Ejemplo" }
  ]);

  const [emisor, setEmisor] = useState({
    nit: "03151312971037",
    nrc: "3400370",
    nombre: "CRISTIAN ALEJANDRO CAJUL BLANCO",
    actividad: "96092 - Servicios n.c.p.",
    direccion: "IZALCO, CTON. HUISCOYOLATE CRIO. EL CEGA",
    correo: "chrishalej997@gmail.com",
    telefono: "7448-4708",
    tipoDte: defaultTipoDte || "Factura Consumidor Final",
    fecha: new Date().toLocaleDateString('es-SV'),
    hora: new Date().toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  });

  const [receptor, setReceptor] = useState({
    tipoPersona: "1", // CAT-029: 1: Persona Natural, 2: Persona Jurídica
    domicilioFiscal: "1", // CAT-018: 1: Domiciliado, 2: No Domiciliado
    tipoDoc: "36", // CAT-022: 36 (NIT), 13 (DUI), etc.
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

  const [pago, setPago] = useState({
    condicion: "Contado",
    metodo: "Billetes y monedas",
    monto: 0,
    pagos: []
  });

  const [responsables, setResponsables] = useState({
    emisorNombre: "CRISTIAN ALEJANDRO CAJUL BLANCO",
    emisorDocTipo: "36",
    emisorDoc: "056347175",
    receptorNombre: "",
    receptorDocTipo: "36",
    receptorDoc: ""
  });

  const [observaciones, setObservaciones] = useState("");

  const [docRelacionado, setDocRelacionado] = useState({
    tipoDoc: "03", // CAT-002 Comprobante de Crédito Fiscal
    tipoGeneracion: "2", // CAT-007 Electrónica
    tipoDocumentoAsociado: "1", // CAT-021 Emisor
    codigoGeneracion: "",
    fechaGeneracion: ""
  });

  const [datosEntrega, setDatosEntrega] = useState({
    tituloBienes: "01", // CAT-027 Depósito
    modoTransporte: "1", // CAT-028 Terrestre
    recintoFiscal: "", // CAT-026 Recinto Fiscal
  });

  const [tipoDonacion, setTipoDonacion] = useState("1"); // CAT-025 Efectivo

  // Reloj dinámico en tiempo real para la fecha y hora de emisión
  const [fechaHoraActual, setFechaHoraActual] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setFechaHoraActual(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fechaActualFormateada = fechaHoraActual.toLocaleDateString('es-SV');
  const horaActualFormateada = fechaHoraActual.toLocaleTimeString('es-SV', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // --- LOGIC ---
  const agregarItem = () => {
    setItemParaEditar(null);
    setModalItemOpen(true);
  };

  const handleGuardarItemModal = (itemGuardado) => {
    if (itemParaEditar) {
      setItems(items.map(it => it.id === itemGuardado.id ? { ...it, ...itemGuardado } : it));
      setItemParaEditar(null);
    } else {
      setItems([...items, itemGuardado]);
    }
  };

  const eliminarItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'cantidad' || field === 'precio' || field === 'subTotalGravado' || field === 'descuento') {
          // Si estamos en Nota de Crédito o Débito, el total puede ser la suma de los desgloses
          if (emisor.tipoDte === "Nota de Crédito" || emisor.tipoDte === "Nota de Débito") {
            updated.total = (updated.subTotalNoSujeto || 0) + (updated.subTotalExento || 0) + (updated.subTotalGravado || 0);
          } else if (emisor.tipoDte === "Factura de Sujeto Excluido") {
            updated.ventas = (updated.cantidad * updated.precio) - (updated.descuento || 0);
            updated.total = updated.ventas;
          } else {
            updated.total = updated.cantidad * updated.precio;
            updated.subTotalGravado = updated.total;
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const isNota = emisor.tipoDte === "Nota de Crédito" || emisor.tipoDte === "Nota de Débito";
  const isSujetoExcluido = emisor.tipoDte === "Factura de Sujeto Excluido";
  const isDonacion = emisor.tipoDte === "Comprobante de Donación" || emisor.tipoDte?.toLowerCase().includes("donación");
  const isExportacion = emisor.tipoDte === "Facturas de exportación" || emisor.tipoDte?.toLowerCase().includes("exportación");

  const totalNoSujeto = items.reduce((acc, item) => acc + (item.subTotalNoSujeto || 0), 0);
  const totalExento = items.reduce((acc, item) => acc + (item.subTotalExento || 0), 0);
  const totalGravado = items.reduce((acc, item) => acc + (isNota ? (item.subTotalGravado || 0) : item.total), 0);

  const [ivaRetenido, setIvaRetenido] = useState(0);
  const [ivaPercibido, setIvaPercibido] = useState(0);
  const [retencionRenta, setRetencionRenta] = useState(0);
  const [retencionRentaPercent, setRetencionRentaPercent] = useState(10);

  const totalOperaciones = items.reduce((acc, item) => acc + (item.cantidad * item.precio), 0);
  const totalDescuento = items.reduce((acc, item) => acc + (item.descuento || 0), 0);

  // Subtotal general de los detalles de la operación
  const subTotalGeral = isSujetoExcluido ? (totalOperaciones - totalDescuento) : totalGravado;

  // Efecto para calcular retención de renta automáticamente si es Sujeto Excluido
  useEffect(() => {
    if (isSujetoExcluido) {
      setRetencionRenta((subTotalGeral * retencionRentaPercent) / 100);
    }
  }, [subTotalGeral, retencionRentaPercent, isSujetoExcluido]);

  // Efecto para sincronizar automáticamente el monto en "Condición de la Operación" con el subtotal de "Detalle de la Operación"
  useEffect(() => {
    setPago((prev) => ({
      ...prev,
      monto: subTotalGeral > 0 ? parseFloat(subTotalGeral.toFixed(2)) : 0,
    }));
  }, [subTotalGeral]);

  const totalPagar = isSujetoExcluido
    ? (subTotalGeral - retencionRenta)
    : (totalGravado + totalNoSujeto + totalExento - ivaRetenido + ivaPercibido);

  const handleEmitirDte = async () => {
    setLoadingEmitir(true);
    setEmisionError(null);
    setEmisionResultado(null);
    try {
      let tipoDteId = 1;
      const t = emisor.tipoDte || "";
      if (t.includes("Crédito Fiscal")) tipoDteId = 2;
      else if (t.includes("Nota de Crédito")) tipoDteId = 3;
      else if (t.includes("Nota de Débito")) tipoDteId = 4;
      else if (t.includes("Sujeto Excluido")) tipoDteId = 9;
      else if (t.includes("Exportación")) tipoDteId = 8;
      else if (t.includes("Donación")) tipoDteId = 10;

      const payload = {
        emisor_id: 1,
        tipo_dte: tipoDteId,
        receptor_nombre: receptor.nombre || "Consumidor Final",
        receptor_documento: receptor.numDoc || null,
        receptor_tipo_documento: receptor.tipoDoc || "36",
        receptor_tipo_persona: receptor.tipoPersona || "1",
        receptor_domicilio_fiscal: receptor.domicilioFiscal || "1",
        receptor_nrc: receptor.nrc || null,
        receptor_cod_actividad: receptor.codActividad || null,
        receptor_actividad_economica: receptor.actividadEconomica || null,
        receptor_correo: receptor.correo || null,
        receptor_direccion: receptor.complemento || "San Salvador",
        receptor_departamento: receptor.departamento || "06",
        receptor_municipio: receptor.municipio || "23",
        receptor_distrito: receptor.distrito || "01",
        receptor_complemento: receptor.complemento || "Sin complemento",
        items: items.map(it => ({
          descripcion: it.descripcion || "Producto/Servicio",
          cantidad: parseFloat(it.cantidad) || 1,
          precio: parseFloat(it.precio) || 0,
          unidad_medida: it.unidadMedida || "59",
        })),
        condicion_operacion: pago.condicion,
        forma_pago: pago.metodo,
        documento_relacionado: isNota ? docRelacionado : null,
        datos_entrega: datosEntrega,
        tipo_donacion: isDonacion ? tipoDonacion : null,
        total_pagar: parseFloat(totalPagar.toFixed(2)),
      };

      const res = await batchService.create(payload);
      setEmisionResultado(res.data);
    } catch (err) {
      setEmisionError(err.response?.data?.error || err.message || "Error al emitir DTE ante Ministerio de Hacienda");
    } finally {
      setLoadingEmitir(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 pb-12">
      {/* ========================================================================= */}
      {/* SECCIÓN: MODAL ÍTEM DTE OFICIAL (MINISTERIO DE HACIENDA)                   */}
      {/* ========================================================================= */}
      <ModalItemDte
        isOpen={modalItemOpen}
        onClose={() => {
          setModalItemOpen(false);
          setItemParaEditar(null);
        }}
        onSave={handleGuardarItemModal}
        initialData={itemParaEditar}
      />

      {/* ========================================================================= */}
      {/* SECCIÓN: ENCABEZADO Y ACCIONES PRINCIPALES (EMISIÓN / BORRADOR)           */}
      {/* ========================================================================= */}
      <div className="bg-[#1A2B3C] text-white pt-8 pb-16 px-6 mb-[-4rem]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <DocumentTextIcon className="w-8 h-8 text-blue-400" />
              {emisor.tipoDte}
            </h1>
            <p className="text-blue-200 mt-1 opacity-80">Sistema de Facturación Electrónica</p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-medium transition-all backdrop-blur-sm">
              Guardar Borrador
            </button>
            <button
              onClick={handleEmitirDte}
              disabled={loadingEmitir}
              className="px-8 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.02]"
            >
              {loadingEmitir ? "EMITIENDO..." : "EMITIR DOCUMENTO"}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN: NOTIFICACIONES DE TRANSMISIÓN MH (ALERTAS DE ÉXITO / ERROR)      */}
      {/* ========================================================================= */}
      {emisionResultado && (
        <div className="max-w-7xl mx-auto px-6 mt-6 mb-2">
          <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-7 h-7 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm text-white">DTE Emitido y Transmitido con Éxito</p>
                <p className="text-xs text-emerald-300 mt-0.5">
                  Código de Generación: <span className="font-mono text-white">{emisionResultado.dte?.codigo_generacion || emisionResultado.codigo_generacion}</span>
                </p>
                <p className="text-xs text-emerald-300">
                  Sello MH: <span className="font-mono text-white">{emisionResultado.dte?.sello_recepcion || emisionResultado.transmission?.sello || "Otorgado"}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {emisionResultado.dte?.id && (
                <>
                  <a
                    href={batchService.getPdfUrl(emisionResultado.dte.id, true)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    VER PDF
                  </a>
                  <button
                    type="button"
                    onClick={() => batchService.downloadPdf(emisionResultado.dte.id, emisionResultado.dte.codigo_generacion)}
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    DESCARGAR PDF
                  </button>
                </>
              )}
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-full font-bold">
                ESTADO: {emisionResultado.dte?.estado_actual || "ACEPTADO"}
              </span>
            </div>
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

          {/* ========================================================================= */}
          {/* SECCIÓN 1: DATOS DEL EMISOR                                              */}
          {/* ========================================================================= */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-blue-50/30 px-8 py-3 border-b border-gray-100 flex justify-between items-center">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">Datos del Emisor</p>
              <span className="text-[10px] font-medium text-blue-400">Configurado vía Certificado</span>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-sm font-black text-gray-900 tracking-tight">{emisor.nombre}</p>
                  <p className="text-xs text-gray-500 font-medium">NIT: {emisor.nit} | NRC: {emisor.nrc}</p>
                  <div className="pt-2 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-600 rounded">ACTIVIDAD</span>
                    <p className="text-xs text-gray-700">{emisor.actividad}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-l border-gray-100 pl-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Documento</p>
                    <p className="text-sm font-bold text-blue-600">{emisor.tipoDte}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Emisión
                    </p>
                    <p className="text-sm text-gray-700 font-medium">{fechaActualFormateada}</p>
                    <p className="text-[11px] text-gray-500 font-mono font-semibold">{horaActualFormateada}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Dirección</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{emisor.direccion}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <InformationCircleIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Contacto</p>
                    <p className="text-xs text-gray-600">{emisor.correo}</p>
                    <p className="text-xs text-gray-600">{emisor.telefono}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECCIÓN 2: DOCUMENTO RELACIONADO (NOTAS DE CRÉDITO Y DÉBITO)             */}
          {/* ========================================================================= */}
          {isNota && (
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-purple-50/50 px-8 py-4 border-b border-gray-100 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-black">Información del Documento Relacionado</h3>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-black ml-1">Tipo de Documento (CAT-002)</label>
                    <select
                      className="w-full bg-[#777778] text-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                      value={docRelacionado.tipoDoc}
                      onChange={(e) => setDocRelacionado({ ...docRelacionado, tipoDoc: e.target.value })}
                    >
                      {CAT_DOCUMENTO.map((doc) => (
                        <option key={doc.codigo} value={doc.codigo} className="text-gray-900 bg-white">
                          {doc.codigo} - {doc.descripcion}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-black ml-1">Tipo de Generación (CAT-007)</label>
                    <select
                      className="w-full bg-[#777778] text-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                      value={docRelacionado.tipoGeneracion}
                      onChange={(e) => setDocRelacionado({ ...docRelacionado, tipoGeneracion: e.target.value })}
                    >
                      {CAT_GeneracionDocs.map((gen) => (
                        <option key={gen.codigo} value={gen.codigo} className="text-gray-900 bg-white">
                          {gen.descripcion}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-black ml-1">Sujeto Emisor Doc. Asociado (CAT-021)</label>
                    <select
                      className="w-full bg-[#777778] text-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                      value={docRelacionado.tipoDocumentoAsociado}
                      onChange={(e) => setDocRelacionado({ ...docRelacionado, tipoDocumentoAsociado: e.target.value })}
                    >
                      {CAT_DOCUMENTOS_ASOCIADO.map((asoc) => (
                        <option key={asoc.codigo} value={asoc.codigo} className="text-gray-900 bg-white">
                          {asoc.codigo} - {asoc.descripcion}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-black ml-1">Código de Generación / Correlativo</label>
                    <input
                      type="text"
                      placeholder="Ingrese el número de documento"
                      className="w-full bg-[#777778] border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                      value={docRelacionado.codigoGeneracion}
                      onChange={(e) => setDocRelacionado({ ...docRelacionado, codigoGeneracion: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-black ml-1">Fecha de Generación</label>
                    <input
                      type="date"
                      className="w-full bg-[#777778] border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                      value={docRelacionado.fechaGeneracion}
                      onChange={(e) => setDocRelacionado({ ...docRelacionado, fechaGeneracion: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ========================================================================= */}
          {/* SECCIÓN 3: INFORMACIÓN DE LA DONACIÓN (SI APLICA)                         */}
          {/* ========================================================================= */}
          {isDonacion && (
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-rose-50/50 px-8 py-4 border-b border-gray-100 flex items-center gap-2">
                <HeartIcon className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-black">Información de la Donación</h3>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-black ml-1">Tipo de Donación (CAT-025)</label>
                  <select
                    className="w-full bg-[#777778] text-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer"
                    value={tipoDonacion}
                    onChange={(e) => setTipoDonacion(e.target.value)}
                  >
                    {CAT_TIPO_DONACION.map((td) => (
                      <option key={td.codigo} value={td.codigo} className="text-gray-900 bg-white">
                        {td.codigo} - {td.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>
          )}

          {/* ========================================================================= */}
          {/* SECCIÓN 4: INFORMACIÓN DEL RECEPTOR / CLIENTE                             */}
          {/* ========================================================================= */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50/50 px-8 py-4 border-b border-gray-100 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-black" />
              <h3 className="font-bold text-black">{isSujetoExcluido ? 'Sujeto Excluido' : 'Información del Receptor'}</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* CAT-029 y CAT-018 ocultos temporalmente según requerimiento */}

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-black ml-1">Tipo Documento (CAT-022)</label>
                    <select
                      className="w-full bg-[#777778] text-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none transition-all cursor-pointer"
                      value={receptor.tipoDoc}
                      onChange={(e) => {
                        const nuevoTipo = e.target.value;
                        let docLimpio = receptor.numDoc;
                        if (nuevoTipo === "13" || nuevoTipo === "DUI") {
                          docLimpio = sanitizarSoloNumeros(docLimpio, 9);
                        } else if (nuevoTipo === "36" || nuevoTipo === "NIT") {
                          docLimpio = sanitizarSoloNumeros(docLimpio, 14);
                        }
                        setReceptor({ ...receptor, tipoDoc: nuevoTipo, numDoc: docLimpio });
                      }}
                    >
                      {CAT_TIPO_DOCUMENTO_IDENTIFICACION.map((doc) => (
                        <option key={doc.codigo} value={doc.codigo} className="text-gray-900 bg-white">
                          {doc.descripcion} ({doc.codigo})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-gray-500 ml-1">
                        {receptor.tipoDoc === "13" || receptor.tipoDoc === "DUI"
                          ? "DUI"
                          : receptor.tipoDoc === "36" || receptor.tipoDoc === "NIT"
                            ? "NIT"
                            : "Número Doc."}
                      </label>
                      {(receptor.tipoDoc === "13" || receptor.tipoDoc === "DUI") && receptor.numDoc && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${receptor.numDoc.length === 9
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                          }`}>
                          {receptor.numDoc.length === 9 ? "✓ DUI 9 dígitos" : `${receptor.numDoc.length}/9 dígitos`}
                        </span>
                      )}
                      {(receptor.tipoDoc === "36" || receptor.tipoDoc === "NIT") && receptor.numDoc && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${receptor.numDoc.length === 14 || receptor.numDoc.length === 9
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                          }`}>
                          {receptor.numDoc.length === 14 ? "✓ NIT 14 dígitos" : receptor.numDoc.length === 9 ? "✓ Homologado 9 dígitos" : `${receptor.numDoc.length}/14 dígitos`}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      inputMode={
                        receptor.tipoDoc === "13" || receptor.tipoDoc === "DUI" || receptor.tipoDoc === "36" || receptor.tipoDoc === "NIT"
                          ? "numeric"
                          : "text"
                      }
                      pattern={
                        receptor.tipoDoc === "13" || receptor.tipoDoc === "DUI" || receptor.tipoDoc === "36" || receptor.tipoDoc === "NIT"
                          ? "[0-9]*"
                          : undefined
                      }
                      maxLength={
                        receptor.tipoDoc === "13" || receptor.tipoDoc === "DUI"
                          ? 9
                          : receptor.tipoDoc === "36" || receptor.tipoDoc === "NIT"
                            ? 14
                            : 30
                      }
                      placeholder={
                        receptor.tipoDoc === "13" || receptor.tipoDoc === "DUI"
                          ? "Solo números"
                          : receptor.tipoDoc === "36" || receptor.tipoDoc === "NIT"
                            ? "Solo números "
                            : "Número de documento"
                      }
                      className="w-full bg-[#777778] text-white placeholder-gray-300 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      value={receptor.numDoc}
                      onKeyDown={(e) => {
                        if (
                          receptor.tipoDoc === "13" ||
                          receptor.tipoDoc === "DUI" ||
                          receptor.tipoDoc === "36" ||
                          receptor.tipoDoc === "NIT"
                        ) {
                          prevenirNoNumerico(e);
                        }
                      }}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (receptor.tipoDoc === "13" || receptor.tipoDoc === "DUI") {
                          val = sanitizarSoloNumeros(val, 9);
                        } else if (receptor.tipoDoc === "36" || receptor.tipoDoc === "NIT") {
                          val = sanitizarSoloNumeros(val, 14);
                        } else {
                          val = val.replace(/['";\-\-/*=]/g, "");
                        }
                        setReceptor({ ...receptor, numDoc: val });
                      }}
                    />
                    {(receptor.tipoDoc === "13" || receptor.tipoDoc === "DUI") && (
                      <p className="text-[10px] text-gray-400 pl-1">
                        DUI: Solo números (0-9).
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 ml-1">{isSujetoExcluido ? 'Nombre del Receptor' : 'Nombre del Cliente'}</label>
                  <input
                    type="text"
                    placeholder={isSujetoExcluido ? 'Nombre completo del receptor' : 'Nombre completo del cliente'}
                    className="w-full bg-[#777778] text-white placeholder-gray-300 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={receptor.nombre}
                    onChange={(e) => setReceptor({ ...receptor, nombre: e.target.value.replace(/['";\-\-/*=]/g, "") })}
                  />
                </div>
                {!isSujetoExcluido && (
                  <>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-gray-500 ml-1">NRC</label>
                        {receptor.nrc && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${receptor.nrc.length >= 1 && receptor.nrc.length <= 8
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                            }`}>
                            {`✓ NRC: ${receptor.nrc.length} dígitos`}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        placeholder="Solo números (máx. 10 dígitos)"
                        className="w-full bg-[#777778] text-white placeholder-gray-300 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        value={receptor.nrc}
                        onKeyDown={prevenirNoNumerico}
                        onChange={(e) => {
                          // Solo números (0-9), máx 10 dígitos. Elimina instantáneamente letras, símbolos y patrones SQL
                          const val = sanitizarSoloNumeros(e.target.value, 10);
                          setReceptor({ ...receptor, nrc: val });
                        }}
                      />
                      <p className="text-[10px] text-gray-400 pl-1 flex items-center gap-1">
                        <ShieldCheckIcon className="w-3 h-3 text-emerald-500 inline-block" />
                        NRC: Solo dígitos (0-9).
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 ml-1">Nombre Comercial</label>
                      <input
                        type="text"
                        placeholder="Personalizar nombre comercial"
                        className="w-full bg-[#777778] text-white placeholder-gray-300 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        value={receptor.nombreComercial}
                        onChange={(e) => setReceptor({ ...receptor, nombreComercial: e.target.value.replace(/['";\-\-/*=]/g, "") })}
                      />
                    </div>
                  </>
                )}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Actividad Económica</label>
                    {receptor.codActividad && (
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-mono px-2 py-0.5 rounded-full font-bold">
                        Cód: {receptor.codActividad}
                      </span>
                    )}
                  </div>
                  <select
                    className="w-full bg-[#777778] text-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
                    value={receptor.codActividad ? `${receptor.codActividad}||${receptor.actividadEconomica}` : ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        setReceptor({ ...receptor, codActividad: "", actividadEconomica: "" });
                      } else {
                        const [codigo, ...descParts] = val.split("||");
                        setReceptor({
                          ...receptor,
                          codActividad: codigo,
                          actividadEconomica: descParts.join("||")
                        });
                      }
                    }}
                  >
                    <option value="" className="text-gray-900 bg-white">-- Seleccione Actividad Económica (Catálogo MH) --</option>
                    {CAT_ACTIVIDAD_ECONOMICA.map((act, idx) => (
                      <option
                        key={`${act.codigo}-${idx}`}
                        value={`${act.codigo}||${act.descripcion}`}
                        className="text-gray-900 bg-white"
                      >
                        {act.codigo} - {act.descripcion}
                      </option>
                    ))}
                  </select>
                  {receptor.actividadEconomica && (
                    <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2 mt-1">
                      <span className="font-mono font-bold text-blue-700 bg-blue-200/70 px-1.5 py-0.5 rounded text-[11px]">
                        {receptor.codActividad}
                      </span>
                      <span className="flex-1 text-[11px] leading-snug text-blue-950 font-medium">
                        {receptor.actividadEconomica}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4 text-xs font-semibold text-gray-500 ">
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
                    className="w-full  bg-[#777778] text-white  border border-gray-200 rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                    value={receptor.complemento}
                    onChange={(e) => setReceptor({ ...receptor, complemento: e.target.value })}
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Correo electrónico</label>
                    <input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      className="w-full bg-[#777778] text-white white-space-pre-wrap border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                      value={receptor.correo}
                      onChange={(e) => setReceptor({ ...receptor, correo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Teléfono</label>
                    <input
                      type="text"
                      placeholder="7000-0000"
                      className="w-full bg-[#777778] text-white white-space-pre-wrap border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                      value={receptor.telefono}
                      onChange={(e) => setReceptor({ ...receptor, telefono: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECCIÓN 5: DETALLE DE LA OPERACIÓN (PRODUCTOS, SERVICIOS Y SUBTOTALES)    */}
          {/* ========================================================================= */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50/50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingCartIcon className="w-5 h-5 text-black" />
                <h3 className="font-bold text-gray-700">Detalle de la Operación</h3>
              </div>
              <button
                onClick={agregarItem}
                className="inline-flex items-center px-4 py-2 bg-[#0088FF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md transition-all transform active:scale-95"
              >
                <PlusIcon className="w-4 h-4 mr-1.5" /> AGREGAR DETALLE ▾
              </button>
            </div>
            {/*tabla para mostrar los items*/}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-black uppercase tracking-[0.15em] border-b border-gray-50">
                    <th className="py-4 px-8 font-bold">{isSujetoExcluido ? 'Descripción' : (isNota ? 'Cantidad' : 'Unidad de Medida')}</th>
                    <th className="py-4 px-4 font-bold">{isSujetoExcluido ? 'Unidad de Medida' : 'Descripción'}</th>
                    <th className="py-4 px-4 font-bold w-24">{isSujetoExcluido ? 'Cantidad' : (isNota ? 'Precio' : 'Cantidad')}</th>
                    {!isNota && <th className="py-4 px-4 font-bold w-32">{isSujetoExcluido ? 'Precio' : 'Precio'}</th>}
                    {isNota ? (
                      <>
                        <th className="py-4 px-4 font-bold w-32 text-center">No sujeto</th>
                        <th className="py-4 px-4 font-bold w-32 text-center">Exento</th>
                        <th className="py-4 px-4 font-bold w-32 text-center">Gravado</th>
                      </>
                    ) : (
                      isSujetoExcluido ? (
                        <>
                          <th className="py-4 px-4 font-bold w-32 text-center text-[8px]">Descuento, Bonificación, Rebajas por ítem</th>
                          <th className="py-4 px-4 font-bold w-32 text-center">Ventas</th>
                        </>
                      ) : (
                        <th className="py-4 px-4 font-bold w-32">Sub Total</th>
                      )
                    )}
                    <th className="py-4 px-8 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((item) => (
                    <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-8">
                        {isSujetoExcluido ? (
                          <input
                            type="text"
                            placeholder="Descripción..."
                            className="w-full bg-transparent border-none text-sm text-gray-800 placeholder-gray-300 focus:ring-0 outline-none"
                            value={item.descripcion}
                            onChange={(e) => updateItem(item.id, 'descripcion', e.target.value)}
                          />
                        ) : (
                          isNota ? (
                            <input
                              type="number"
                              className="w-16 bg-gray-100/50 border-none rounded-lg px-2 py-1 text-sm font-medium text-gray-700"
                              value={item.cantidad}
                              onChange={(e) => updateItem(item.id, 'cantidad', parseFloat(e.target.value) || 0)}
                            />
                          ) : (
                            <select
                              className="bg-transparent border-none text-sm text-gray-600 focus:ring-0 outline-none cursor-pointer max-w-[130px]"
                              value={item.unidadMedida}
                              onChange={(e) => updateItem(item.id, 'unidadMedida', e.target.value)}
                            >
                              {CAT_UNIDAD_MEDIDA.map((u) => (
                                <option key={u.codigo} value={u.codigo}>
                                  {u.descripcion} ({u.codigo})
                                </option>
                              ))}
                            </select>
                          )
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {isSujetoExcluido ? (
                          <select
                            className="bg-transparent border-none text-sm text-gray-600 focus:ring-0 outline-none cursor-pointer max-w-[130px]"
                            value={item.unidadMedida}
                            onChange={(e) => updateItem(item.id, 'unidadMedida', e.target.value)}
                          >
                            {CAT_UNIDAD_MEDIDA.map((u) => (
                              <option key={u.codigo} value={u.codigo}>
                                {u.descripcion} ({u.codigo})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder="Descripción del producto..."
                            className="w-full bg-transparent border-none text-sm text-gray-800 placeholder-gray-300 focus:ring-0 outline-none"
                            value={item.descripcion}
                            onChange={(e) => updateItem(item.id, 'descripcion', e.target.value)}
                          />
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          {(isSujetoExcluido || !isNota) ? (
                            <input
                              type="number"
                              className="w-16 bg-gray-100/50 border-none rounded-lg px-2 py-1 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500/20"
                              value={item.cantidad}
                              onChange={(e) => updateItem(item.id, 'cantidad', parseFloat(e.target.value) || 0)}
                              min={1}
                            />
                          ) : (
                            <>
                              <span className="text-gray-700 text-xs">$</span>
                              <input
                                type="number"
                                className="w-24 bg-transparent border-none p-0 text-sm font-medium text-gray-700 focus:ring-0"
                                value={item.precio}
                                min={0}
                                onChange={(e) => updateItem(item.id, 'precio', parseFloat(e.target.value) || 0)}
                              />
                            </>
                          )}
                        </div>
                      </td>
                      {!isNota && (
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400 text-xs">$</span>
                            <input
                              type="number"
                              className="w-24 bg-transparent border-none p-0 text-sm font-medium text-gray-700 focus:ring-0"
                              value={item.precio}
                              min={0}
                              onChange={(e) => updateItem(item.id, 'precio', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </td>
                      )}
                      {isNota ? (
                        <>
                          <td className="py-4 px-4">
                            <input
                              type="number"
                              className="w-24 bg-gray-50 border border-gray-100 rounded px-2 py-1 text-sm text-right focus:ring-1 focus:ring-purple-200 outline-none"
                              value={item.subTotalNoSujeto}
                              onChange={(e) => updateItem(item.id, 'subTotalNoSujeto', parseFloat(e.target.value) || 0)}
                            />
                          </td>
                          <td className="py-4 px-4">
                            <input
                              type="number"
                              className="w-24 bg-gray-50 border border-gray-100 rounded px-2 py-1 text-sm text-right focus:ring-1 focus:ring-purple-200 outline-none"
                              value={item.subTotalExento}
                              onChange={(e) => updateItem(item.id, 'subTotalExento', parseFloat(e.target.value) || 0)}
                            />
                          </td>
                          <td className="py-4 px-4">
                            <input
                              type="number"
                              className="w-24 bg-gray-50 border border-gray-100 rounded px-2 py-1 text-sm text-right focus:ring-1 focus:ring-purple-200 outline-none font-bold text-gray-900"
                              value={item.subTotalGravado}
                              onChange={(e) => updateItem(item.id, 'subTotalGravado', parseFloat(e.target.value) || 0)}
                            />
                          </td>
                        </>
                      ) : (
                        isSujetoExcluido ? (
                          <>
                            <td className="py-4 px-4">
                              <input
                                type="number"
                                className="w-24 bg-gray-50 border border-gray-100 rounded px-2 py-1 text-sm text-right focus:ring-1 focus:ring-blue-200 outline-none"
                                value={item.descuento}
                                onChange={(e) => updateItem(item.id, 'descuento', parseFloat(e.target.value) || 0)}
                              />
                            </td>
                            <td className="py-4 px-4 text-sm font-bold text-gray-900 text-right">$ {item.ventas.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          </>
                        ) : (
                          <td className="py-4 px-4 text-sm font-bold text-gray-900">$ {item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        )
                      )}
                      <td className="py-4 px-8 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => { setItemParaEditar(item); setModalItemOpen(true); }}
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                            title="Editar ítem con modal oficial"
                          >
                            <PencilSquareIcon className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => eliminarItem(item.id)}
                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Eliminar ítem"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          {/* ========================================================================= */}
          {/* SECCIÓN 6: CONDICIÓN DE LA OPERACIÓN Y FORMAS DE PAGO                     */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <CreditCardIcon className="w-5 h-5 text-black" />
                <h3 className="font-bold text-black">Condición de la Operación</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-black">Condición (CAT-016)</label>
                  <select
                    className="w-full bg-[#777778] text-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none cursor-pointer"
                    value={pago.condicion}
                    onChange={(e) => setPago({ ...pago, condicion: e.target.value })}
                  >
                    {CAT_CONDICION_PAGO.map((cp) => (
                      <option key={cp.codigo} value={cp.descripcion} className="text-gray-900 bg-white">
                        {cp.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-black">Forma Pago (CAT-017)</label>
                  <select
                    className="w-full bg-[#777778] text-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none cursor-pointer"
                    value={pago.metodo}
                    onChange={(e) => setPago({ ...pago, metodo: e.target.value })}
                  >
                    {CAT_FORMA_PAGOS.map((fp) => (
                      <option key={fp.codigo} value={fp.descripcion} className="text-gray-900 bg-white">
                        {fp.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* ---> INPUT MONTO: CARGADO CON EL SUBTOTAL DE DETALLES DE LA OPERACIÓN <--- */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-black">Monto</label>
                <input
                  type="number"
                  step="any"
                  placeholder="Monto Pago"
                  min={0}
                  max={totalPagar}
                  value={pago.monto !== undefined && pago.monto !== null && pago.monto !== "" ? pago.monto : subTotalGeral}
                  onChange={(e) => setPago({ ...pago, monto: e.target.value === "" ? "" : parseFloat(e.target.value) || 0 })}
                  className="w-full bg-gray-50 text-black border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div className="overflow-x-auto pt-4">
                <table className="w-full text-[10px] text-left">
                  <thead>
                    <tr className="text-black uppercase font-bold border-b border-gray-50">
                      <th className="pb-2 pr-2">Forma de Pago</th>
                      <th className="pb-2 px-2 text-right">Monto</th>
                      <th className="pb-2 px-2">No. Documento</th>
                      <th className="pb-2 px-2">Plazo</th>
                      <th className="pb-2 pl-2">Período</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-50/50">
                      <td className="py-2 pr-2 text-black">{pago.metodo}</td>
                      <td className="py-2 px-2 text-right font-medium text-black">$ {(pago.monto !== undefined && pago.monto !== null && pago.monto !== "" ? Number(pago.monto) : subTotalGeral).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="py-2 px-2 text-black italic">N/A</td>
                      <td className="py-2 px-2 text-black italic">N/A</td>
                      <td className="py-2 pl-2 text-black italic">N/A</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-black">Observaciones</label>
                <textarea
                  className="w-full bg-[#777778] text-white border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none resize-none"
                  rows={isNota ? 6 : 3}
                  placeholder="Observaciones al documento"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                ></textarea>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* SECCIÓN 7: RESPONSABLES DE RECEPCIÓN Y ENTREGA DEL DOCUMENTO              */}
            {/* ========================================================================= */}
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <TruckIcon className="w-5 h-5 text-black" />
                <h3 className="font-bold text-gray-700">{isNota ? 'Información obligatoria, recepción entrega documento' : 'Responsables de recepción y entrega del documento'}</h3>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-blue-600 uppercase">
                    {isNota ? 'Responsable por parte del Emisor' : 'Responsable de emitir el documento'}
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-black ml-1 uppercase">Tipo Doc (CAT-022)</label>
                        <select
                          className="w-full bg-[#777778] text-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none cursor-pointer"
                          value={responsables.emisorDocTipo}
                          onChange={(e) => setResponsables({ ...responsables, emisorDocTipo: e.target.value })}
                        >
                          {CAT_TIPO_DOCUMENTO_IDENTIFICACION.map((doc) => (
                            <option key={doc.codigo} value={doc.codigo} className="text-gray-900 bg-white">
                              {doc.descripcion} ({doc.codigo})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[10px] font-semibold text-black ml-1 uppercase">N°. Documento</label>
                        <input
                          type="text"
                          inputMode={responsables.emisorDocTipo === "13" || responsables.emisorDocTipo === "36" ? "numeric" : "text"}
                          pattern={responsables.emisorDocTipo === "13" || responsables.emisorDocTipo === "36" ? "[0-9]*" : undefined}
                          maxLength={responsables.emisorDocTipo === "13" ? 9 : responsables.emisorDocTipo === "36" ? 14 : 30}
                          placeholder="Número de documento"
                          className="w-full text-black bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500"
                          value={responsables.emisorDoc}
                          onKeyDown={(e) => {
                            if (responsables.emisorDocTipo === "13" || responsables.emisorDocTipo === "36") {
                              prevenirNoNumerico(e);
                            }
                          }}
                          onChange={(e) => {
                            let val = e.target.value;
                            if (responsables.emisorDocTipo === "13") val = sanitizarSoloNumeros(val, 9);
                            else if (responsables.emisorDocTipo === "36") val = sanitizarSoloNumeros(val, 14);
                            else val = val.replace(/['";\-\-/*=]/g, "");
                            setResponsables({ ...responsables, emisorDoc: val });
                          }} readOnly
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-black ml-1 uppercase">Nombre</label>
                      <input
                        type="text"
                        placeholder="Responsable de emitir"
                        className="w-full text-black bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500"
                        value={responsables.emisorNombre}
                        onChange={(e) => setResponsables({ ...responsables, emisorNombre: e.target.value.replace(/['";\-\-/*=]/g, "") })} readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-50">
                  <p className="text-[10px] font-bold text-gray-600 uppercase">
                    {isNota ? 'Responsable por parte del Receptor' : 'Responsable de recibir el documento'}
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-black ml-1 uppercase">Tipo Doc (CAT-022)</label>
                        <select
                          className="w-full bg-[#777778] text-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none cursor-pointer"
                          value={responsables.receptorDocTipo}
                          onChange={(e) => setResponsables({ ...responsables, receptorDocTipo: e.target.value })}
                        >
                          {CAT_TIPO_DOCUMENTO_IDENTIFICACION.map((doc) => (
                            <option key={doc.codigo} value={doc.codigo} className="text-gray-900 bg-white">
                              {doc.descripcion} ({doc.codigo})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[10px] font-semibold text-black ml-1 uppercase">N°. Documento</label>
                        <input
                          type="text"
                          inputMode={responsables.receptorDocTipo === "13" || responsables.receptorDocTipo === "36" ? "numeric" : "text"}
                          pattern={responsables.receptorDocTipo === "13" || responsables.receptorDocTipo === "36" ? "[0-9]*" : undefined}
                          maxLength={responsables.receptorDocTipo === "13" ? 9 : responsables.receptorDocTipo === "36" ? 14 : 30}
                          placeholder="Número de documento"
                          className="w-full text-black bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500"
                          value={responsables.receptorDoc}
                          onKeyDown={(e) => {
                            if (responsables.receptorDocTipo === "13" || responsables.receptorDocTipo === "36") {
                              prevenirNoNumerico(e);
                            }
                          }}
                          onChange={(e) => {
                            let val = e.target.value;
                            if (responsables.receptorDocTipo === "13") val = sanitizarSoloNumeros(val, 9);
                            else if (responsables.receptorDocTipo === "36") val = sanitizarSoloNumeros(val, 14);
                            else val = val.replace(/['";\-\-/*=]/g, "");
                            setResponsables({ ...responsables, receptorDoc: val });
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-black ml-1 uppercase">Nombre</label>
                      <input
                        type="text"
                        placeholder="Responsable de recibir"
                        className="w-full text-black bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500"
                        value={responsables.receptorNombre}
                        onChange={(e) => setResponsables({ ...responsables, receptorNombre: e.target.value.replace(/['";\-\-/*=]/g, "") })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN 8: RESUMEN FINANCIERO DE LA OPERACIÓN (TOTALES Y RETENCIONES)     */}
        {/* ========================================================================= */}
        {/* COLUMNA DERECHA (RESUMEN FINANCIERO) */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            <section className="bg-[#1A2B3C] text-white rounded-[2.5rem] shadow-2xl p-10 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                Resumen de Operación
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm font-medium">
                    {isSujetoExcluido ? 'Total de Operaciones' : (isNota ? 'Total Gravadas' : 'Total Gravado')}
                  </span>
                  <span className="text-lg font-semibold">$ {isSujetoExcluido ? totalOperaciones.toLocaleString('en-US', { minimumFractionDigits: 2 }) : totalGravado.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>

                {isSujetoExcluido && (
                  <>
                    <div className="flex justify-between items-center text-blue-300">
                      <span className="text-sm font-medium">Descuento Global</span>
                      <span className="text-lg font-semibold">$ 0.00</span>
                    </div>
                    <div className="flex justify-between items-center text-blue-300">
                      <span className="text-sm font-medium">Total monto de descuento</span>
                      <span className="text-lg font-semibold">$ {totalDescuento.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </>
                )}

                {!isSujetoExcluido && (
                  <>
                    <div className="flex justify-between items-center text-red-400">
                      <span className="text-sm font-medium">IVA Retenido</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs">$</span>
                        <input
                          type="number"
                          className="w-20 bg-white/10 border-none rounded px-2 py-0.5 text-right text-sm font-semibold outline-none focus:ring-1 focus:ring-red-400"
                          value={ivaRetenido}
                          onChange={(e) => setIvaRetenido(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-green-400">
                      <span className="text-sm font-medium">{isNota ? 'Percepción IVA' : 'IVA Percibido'}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs">$</span>
                        <input
                          type="number"
                          className="w-20 bg-white/10 border-none rounded px-2 py-0.5 text-right text-sm font-semibold outline-none focus:ring-1 focus:ring-green-400"
                          value={ivaPercibido}
                          onChange={(e) => setIvaPercibido(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                  <span className="text-gray-400 text-sm font-medium">Sub Total</span>
                  <span className="text-lg font-semibold">$ {subTotalGeral.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>

                {isSujetoExcluido && (
                  <div className="flex justify-between items-center text-orange-400">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Retención Renta</span>
                      <div className="flex items-center bg-white/10 rounded px-1">
                        <input
                          type="number"
                          className="w-8 bg-transparent border-none p-0 text-[10px] text-center font-bold outline-none"
                          value={retencionRentaPercent}
                          onChange={(e) => setRetencionRentaPercent(parseFloat(e.target.value) || 0)}
                        />
                        <span className="text-[10px] opacity-50">%</span>
                      </div>
                    </div>
                    <span className="text-lg font-semibold">$ {retencionRenta.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="border-t border-white/10 pt-6 space-y-2">
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest text-center mb-4">
                    {isSujetoExcluido ? 'Total a pagar' : (isNota ? 'Monto Total de la operación' : 'Total a Pagar')}
                  </p>
                  <div className="flex justify-center items-baseline gap-1">
                    <span className="text-2xl font-light text-blue-400">$</span>
                    <span className="text-5xl font-black text-white tracking-tighter">
                      {totalPagar.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 mt-8">
                  <div className="flex justify-between text-[10px] text-gray-500 uppercase font-bold">
                    <span>Monto en letras</span>
                  </div>
                  <p className="text-[11px] text-blue-200 mt-1 italic uppercase">
                    CERO DÓLARES CON 00/100 USD
                  </p>
                </div>
              </div>

              <div className="mt-10">
                <button
                  onClick={handleEmitirDte}
                  disabled={loadingEmitir}
                  className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <CreditCardIcon className="w-5 h-5" />
                  {loadingEmitir ? "EMITIENDO A HACIENDA..." : "CONFIRMAR Y EMITIR"}
                </button>
                <p className="text-[10px] text-gray-500 text-center mt-4 px-4 leading-relaxed">
                  Al emitir, el documento será firmado digitalmente y enviado automáticamente al Ministerio de Hacienda.
                </p>
              </div>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
}
