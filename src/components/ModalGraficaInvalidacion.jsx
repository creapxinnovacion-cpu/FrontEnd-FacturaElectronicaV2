/**
 * FACT_V2 - Frontend Facturación Electrónica (El Salvador)
 *
 * Copyright (c) 2026 Creapx Innovación. Todos los derechos reservados.
 * Software propietario y confidencial de Creapx Innovación.
 * Prohibida su copia, distribución o modificación sin autorización expresa.
 */

import React from "react";
import {
  XMarkIcon,
  PrinterIcon,
  ShieldCheckIcon,
  DocumentArrowDownIcon
} from "@heroicons/react/24/outline";

// Helper para formatear NIT con guiones
function formatNit(nit) {
  if (!nit) return "-";
  const clean = String(nit).replace(/[^0-9]/g, "");
  if (clean.length === 14) {
    return `${clean.substring(0, 4)}-${clean.substring(4, 10)}-${clean.substring(10, 13)}-${clean.substring(13, 14)}`;
  }
  if (clean.length === 9) {
    return `${clean.substring(0, 8)}-${clean.substring(8, 9)}`;
  }
  return nit;
}

// Helper para nombre de Tipo DTE
function getTipoDteNombre(tipo) {
  const t = String(tipo || "").padStart(2, "0");
  switch (t) {
    case "01":
    case "1":
      return "Factura";
    case "03":
    case "2":
      return "Comprobante de Crédito Fiscal";
    case "05":
    case "3":
      return "Nota de Crédito";
    case "06":
    case "4":
      return "Nota de Débito";
    case "11":
      return "Factura de Exportación";
    case "14":
      return "Factura de Sujeto Excluido";
    default:
      return "Factura";
  }
}

// Helper para descripción del motivo / tipo de invalidación (Catálogo 024)
function getTipoAnulacionTexto(tipo) {
  const id = Number(tipo);
  switch (id) {
    case 1:
      return "Error en la información del DTE (se emitirá un DTE de reemplazo)";
    case 2:
      return "Rescindir de la operación realizada";
    case 3:
      return "Otro motivo justificado";
    default:
      return "Rescindir de la operación realizada";
  }
}

// Extraer el payload JSON del evento si viene firmado
function extractEventoPayload(invalidacion) {
  if (!invalidacion) return null;
  if (invalidacion.json_firmado?.payload) {
    return invalidacion.json_firmado.payload;
  }
  const jws = invalidacion.json_firmado?.jws || (typeof invalidacion.json_firmado === "string" ? invalidacion.json_firmado : null);
  if (jws && typeof jws === "string" && jws.includes(".")) {
    try {
      const parts = jws.split(".");
      if (parts[1]) {
        const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const jsonStr = decodeURIComponent(escape(atob(b64)));
        return JSON.parse(jsonStr);
      }
    } catch (e) {
      console.warn("No se pudo decodificar JWS de invalidación:", e);
    }
  }
  return null;
}

export default function ModalGraficaInvalidacion({ open, onClose, data }) {
  if (!open || !data) return null;

  const payload = extractEventoPayload(data);
  const dte = data.dte || {};
  const emisor = dte.emisor || {};

  // 1. Datos del Evento de Invalidación
  const codigoGeneracionEvento =
    payload?.identificacion?.codigoGeneracion ||
    data.codigo_generacion ||
    "-";

  const fechaHoraEvento =
    payload?.identificacion?.fecEmi && payload?.identificacion?.horEmi
      ? `${payload.identificacion.fecEmi} ${payload.identificacion.horEmi}`
      : data.created_at
        ? new Date(data.created_at).toLocaleString("es-SV", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
          }).replace(",", "")
        : new Date().toISOString().replace("T", " ").substring(0, 19);

  const selloRecepcionEvento =
    payload?.selloRecibido ||
    data.sello_recepcion ||
    data.respuesta_mh?.selloRecibido ||
    data.respuesta_mh?.body?.selloRecepcion ||
    "PENDIENTE MH";

  // 2. Emisor
  const emisorNombre =
    payload?.emisor?.nombre ||
    emisor.nombre_comercial ||
    emisor.nombre ||
    "CRISTIAN ALEJANDRO CAJUL BLANCO";

  const emisorNit = formatNit(
    payload?.emisor?.nit || emisor.nit || "056347175"
  );

  const emisorTelefono =
    payload?.emisor?.telefono || emisor.telefono || "74484708";

  const emisorCorreo =
    payload?.emisor?.correo || emisor.correo || "chrishalej997@gmail.com";

  // 3. Receptor
  const receptorNombre =
    payload?.documento?.nombre ||
    dte.receptor_nombre ||
    "Consumidor Final";

  const receptorNit = formatNit(
    payload?.documento?.numDocumento ||
    dte.receptor_nit ||
    dte.receptor_documento ||
    ""
  );

  const receptorCorreo =
    payload?.documento?.correo ||
    dte.receptor_correo ||
    "-";

  // 4. Motivo
  const tipoInvalidacionId =
    payload?.motivo?.tipoAnulacion ??
    data.tipo_invalidacion ??
    2;

  const tipoInvalidacionTexto = getTipoAnulacionTexto(tipoInvalidacionId);

  const motivoTexto =
    payload?.motivo?.motivoAnulacion ||
    data.motivo ||
    "Operación rescindida";

  const responsableNombre =
    payload?.motivo?.nombreResponsable ||
    data.responsable_nombre ||
    emisorNombre;

  const responsableNit = formatNit(
    payload?.motivo?.numDocResponsable ||
    data.responsable_doc_num ||
    emisorNit
  );

  const solicitaNombre =
    payload?.motivo?.nombreSolicita ||
    data.solicita_nombre ||
    receptorNombre;

  const solicitaNit = formatNit(
    payload?.motivo?.numDocSolicita ||
    data.solicita_doc_num ||
    receptorNit
  );

  // 5. Documento Invalidado
  const docTipoCodigo =
    payload?.documento?.tipoDte ||
    (dte.tipo_dte ? String(dte.tipo_dte) : "01");

  const docTipoNombre = getTipoDteNombre(docTipoCodigo);

  const docCodigoGeneracion =
    payload?.documento?.codigoGeneracion ||
    dte.codigo_generacion ||
    "-";

  const docSelloRecepcion =
    payload?.documento?.selloRecibido ||
    dte.sello_recepcion ||
    "-";

  const docNumeroControl =
    payload?.documento?.numeroControl ||
    dte.numero_control ||
    "-";

  const docFechaEmision =
    payload?.documento?.fecEmi ||
    dte.fecha_emision ||
    "-";

  const docReemplazo =
    payload?.documento?.codigoGeneracionR ||
    data.codigo_generacion_reemplazo ||
    "-";

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const jsonToExport = payload || {
      identificacion: {
        version: 3,
        ambiente: "00",
        codigoGeneracion: codigoGeneracionEvento,
        fecEmi: fechaHoraEvento.split(" ")[0],
        horEmi: fechaHoraEvento.split(" ")[1] || "00:00:00",
      },
      emisor: {
        nit: emisorNit,
        nombre: emisorNombre,
        telefono: emisorTelefono,
        correo: emisorCorreo,
      },
      documento: {
        tipoDte: docTipoCodigo,
        codigoGeneracion: docCodigoGeneracion,
        selloRecibido: docSelloRecepcion,
        numeroControl: docNumeroControl,
        fecEmi: docFechaEmision,
        numDocumento: receptorNit,
        nombre: receptorNombre,
      },
      motivo: {
        tipoAnulacion: tipoInvalidacionId,
        motivoAnulacion: motivoTexto,
        nombreResponsable: responsableNombre,
        numDocResponsable: responsableNit,
        nombreSolicita: solicitaNombre,
        numDocSolicita: solicitaNit,
      },
      selloRecibido: selloRecepcionEvento,
    };

    const blob = new Blob([JSON.stringify(jsonToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `EVENTO_INVALIDACION_${codigoGeneracionEvento}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      {/* ESTILOS ESPECÍFICOS PARA IMPRESIÓN */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-area-invalidacion, #print-area-invalidacion * {
            visibility: visible !important;
          }
          #print-area-invalidacion {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 20px !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: 1px solid #333 !important;
          }
          .modal-actions-header {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-gray-200">
        {/* HEADER DE ACCIONES DE LA VENTANA (NO IMPRIMIBLE) */}
        <div className="modal-actions-header flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
              <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Representación Gráfica Oficial</h3>
              <p className="text-[11px] text-slate-400">Evento de Invalidación DTE • Ministerio de Hacienda</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition border border-slate-700"
              title="Descargar JSON oficial del evento"
            >
              <DocumentArrowDownIcon className="w-4 h-4 text-slate-300" />
              <span>Descargar JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/30"
              title="Imprimir documento oficial de invalidación"
            >
              <PrinterIcon className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition ml-2"
              title="Cerrar ventana"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENEDOR CON SCROLL PARA VISUALIZACIÓN */}
        <div className="p-6 md:p-8 max-h-[82vh] overflow-y-auto bg-gray-100 flex justify-center">
          {/* HOJA OFICIAL CON DISEÑO IDÉNTICO AL MODELO DE HACIENDA (IMPRIMIBLE) */}
          <div
            id="print-area-invalidacion"
            className="w-full bg-white text-gray-900 border border-gray-400 rounded-2xl p-6 sm:p-8 font-sans shadow-sm"
            style={{ minHeight: "680px" }}
          >
            {/* ENCABEZADO SUPERIOR */}
            <div className="relative mb-6">
              <span className="absolute top-0 right-0 text-xs font-medium text-gray-700">
                Ver. 3
              </span>
              <h2 className="text-center text-sm sm:text-base font-bold uppercase tracking-wider text-gray-900 pt-1">
                EVENTO DE INVALIDACIÓN
              </h2>
            </div>

            {/* METADATOS DEL EVENTO */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-y-1.5 text-xs text-gray-800 mb-6 font-medium">
              <div className="sm:col-span-3 text-gray-700">Código de Generación:</div>
              <div className="sm:col-span-9 font-mono font-bold text-gray-900">
                {codigoGeneracionEvento}
              </div>

              <div className="sm:col-span-3 text-gray-700">Fecha y hora del evento:</div>
              <div className="sm:col-span-9 text-gray-900">
                {fechaHoraEvento}
              </div>

              <div className="sm:col-span-3 text-gray-700">Sello de Recepción:</div>
              <div className="sm:col-span-9 font-mono text-gray-900">
                {selloRecepcionEvento}
              </div>
            </div>

            {/* BLOQUE EMISOR Y RECEPTOR EN 2 COLUMNAS CON BORDES REDONDEADOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {/* Identificación del Emisor */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 mb-1.5">
                  Identificación del Emisor
                </h4>
                <div className="border border-gray-400 rounded-xl p-3 text-[11px] leading-relaxed space-y-1">
                  <p>
                    <span className="text-gray-600 inline-block w-28">Nombre:</span>
                    <strong className="text-gray-900 uppercase">{emisorNombre}</strong>
                  </p>
                  <p>
                    <span className="text-gray-600 inline-block w-28">NIT:</span>
                    <span className="text-gray-900">{emisorNit}</span>
                  </p>
                  <p>
                    <span className="text-gray-600 inline-block w-28">Teléfono:</span>
                    <span className="text-gray-900">{emisorTelefono}</span>
                  </p>
                  <p>
                    <span className="text-gray-600 inline-block w-28">Correo electrónico:</span>
                    <span className="text-gray-900">{emisorCorreo}</span>
                  </p>
                </div>
              </div>

              {/* Identificación del Receptor */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 mb-1.5">
                  Identificación del Receptor
                </h4>
                <div className="border border-gray-400 rounded-xl p-3 text-[11px] leading-relaxed space-y-1">
                  <p>
                    <span className="text-gray-600 inline-block w-36">Nombre o razón social:</span>
                    <strong className="text-gray-900 uppercase">{receptorNombre}</strong>
                  </p>
                  <p>
                    <span className="text-gray-600 inline-block w-36">NIT:</span>
                    <span className="text-gray-900">{receptorNit || "-"}</span>
                  </p>
                  <p>
                    <span className="text-gray-600 inline-block w-36">Correo electrónico:</span>
                    <span className="text-gray-900">{receptorCorreo}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* INFORMACIÓN RELATIVA AL MOTIVO DE INVALIDACIÓN */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-900 mb-1.5">
                Información relativa al Motivo de Invalidación
              </h4>
              <div className="border border-gray-400 rounded-xl p-3.5 text-[11px] leading-relaxed">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                  <div>
                    <span className="text-gray-600 inline-block w-36">Tipo de Invalidación:</span>
                    <span className="text-gray-900 font-medium">{tipoInvalidacionTexto}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 inline-block w-48">Nombre de quien solicita el evento:</span>
                    <strong className="text-gray-900 uppercase">{solicitaNombre}</strong>
                  </div>

                  <div>
                    <span className="text-gray-600 inline-block w-36">Motivo:</span>
                    <span className="text-gray-900 font-medium">{motivoTexto}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 inline-block w-48">NIT:</span>
                    <span className="text-gray-900">{solicitaNit || "-"}</span>
                  </div>

                  <div>
                    <span className="text-gray-600 inline-block w-48">Nombre de quien realiza el evento:</span>
                    <strong className="text-gray-900 uppercase">{responsableNombre}</strong>
                  </div>
                  <div></div>

                  <div>
                    <span className="text-gray-600 inline-block w-48">NIT:</span>
                    <span className="text-gray-900">{responsableNit || "-"}</span>
                  </div>
                  <div></div>
                </div>
              </div>
            </div>

            {/* TABLA DE DOCUMENTO INVALIDADO */}
            <div className="mb-6">
              <table className="w-full border-collapse border border-gray-400 text-[11px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-800">
                    <th className="border border-gray-400 py-2 px-2 text-center font-bold">
                      Tipo DTE
                    </th>
                    <th className="border border-gray-400 py-2 px-2 text-center font-bold">
                      Código de Generación aplicado
                    </th>
                    <th className="border border-gray-400 py-2 px-2 text-center font-bold">
                      Sello de Recepción
                    </th>
                    <th className="border border-gray-400 py-2 px-2 text-center font-bold">
                      Número de Control del DTE
                    </th>
                    <th className="border border-gray-400 py-2 px-2 text-center font-bold">
                      Fecha de Generación
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-gray-900">
                    <td className="border border-gray-400 py-2.5 px-2 text-center font-semibold">
                      {docTipoNombre}
                    </td>
                    <td className="border border-gray-400 py-2.5 px-2 text-center font-mono text-[10px]">
                      {docCodigoGeneracion}
                    </td>
                    <td className="border border-gray-400 py-2.5 px-2 text-center font-mono text-[10px]">
                      {docSelloRecepcion}
                    </td>
                    <td className="border border-gray-400 py-2.5 px-2 text-center font-mono text-[10px]">
                      {docNumeroControl}
                    </td>
                    <td className="border border-gray-400 py-2.5 px-2 text-center">
                      {docFechaEmision}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* CÓDIGO DE GENERACIÓN QUE REEMPLAZA */}
            <div className="pt-2 text-xs text-gray-800">
              <span className="text-gray-700">Código de Generación que reemplaza al invalidado:</span>
              <span className="ml-4 font-mono font-semibold text-gray-900">
                {docReemplazo}
              </span>
            </div>
          </div>
        </div>

        {/* PIE DEL MODAL (ACCIONES RÁPIDAS) */}
        <div className="modal-actions-header px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/20"
          >
            <PrinterIcon className="w-4 h-4" />
            <span>Imprimir Comprobante</span>
          </button>
        </div>
      </div>
    </div>
  );
}
