import React, { useState } from "react";
import {
  XMarkIcon,
  PrinterIcon,
  ShieldCheckIcon,
  DocumentArrowDownIcon,
  ArrowUturnLeftIcon,
  CheckBadgeIcon,
  EnvelopeIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { eventoService } from "../services/api/evento.service";

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

function getTipoDteNombre(tipo) {
  const t = String(tipo || "").padStart(2, "0");
  switch (t) {
    case "01":
    case "1":
      return "Factura Consumidor Final (01)";
    case "11":
      return "Factura de Exportación (11)";
    case "14":
      return "Factura de Sujeto Excluido (14)";
    default:
      return `DTE ${t}`;
  }
}

function getTipoRetornoTexto(tipo) {
  const id = Number(tipo);
  switch (id) {
    case 1:
      return "Devolución de mercadería / bienes por desperfecto o error";
    case 2:
      return "Devolución o rescisión parcial de la venta";
    case 3:
      return "Ajuste de precio o descuento posterior";
    case 4:
      return "Retorno de envases o embalajes reutilizables";
    case 5:
      return "Devolución total de la operación";
    default:
      return "Devolución de mercadería o ajuste comercial";
  }
}

function extractEventoPayload(retorno) {
  if (!retorno) return null;
  if (retorno.json_firmado?.payload) {
    return retorno.json_firmado.payload;
  }
  const jws = retorno.json_firmado?.jws || (typeof retorno.json_firmado === "string" ? retorno.json_firmado : null);
  if (jws && typeof jws === "string" && jws.includes(".")) {
    try {
      const parts = jws.split(".");
      if (parts[1]) {
        const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const jsonStr = decodeURIComponent(escape(atob(b64)));
        return JSON.parse(jsonStr);
      }
    } catch (e) {
      console.warn("No se pudo decodificar JWS de retorno:", e);
    }
  }
  return null;
}

export default function ModalGraficaRetorno({ open, onClose, data }) {
  const [enviando, setEnviando] = useState(false);

  if (!open || !data) return null;

  const payload = extractEventoPayload(data);
  const dte = data.dte || {};
  const emisor = dte.emisor || {};

  const codigoGeneracionEvento =
    payload?.identificacion?.codigoGeneracion ||
    data.codigo_generacion ||
    "-";

  const fechaHoraEvento =
    payload?.identificacion?.fecEmi && payload?.identificacion?.horEmi
      ? `${payload.identificacion.fecEmi} ${payload.identificacion.horEmi}`
      : data.created_at
      ? new Date(data.created_at).toLocaleString("es-SV")
      : "-";

  const selloRecepcion =
    data.sello_recepcion ||
    data.respuesta_mh?.selloRecibido ||
    data.respuesta_mh?.body?.selloRecepcion ||
    "PENDIENTE DE TRANSMISIÓN";

  const estadoMh =
    (data.respuesta_mh?.estado || data.estado_actual || "PROCESADO").toUpperCase();

  const isAceptado = estadoMh === "ACEPTADO" || estadoMh === "PROCESADO";

  const docRel = payload?.documentoRelacionado?.[0] || {};
  const codigoGeneracionDte = docRel.codigoGeneracion || dte.codigo_generacion || "-";
  const tipoDteRel = docRel.tipoDocumento || dte.tipo_dte || "01";
  const fechaDteRel = docRel.fechaEmision || dte.fecha_emision?.split("T")[0] || "-";
  const numeroControlDte = dte.numero_control || "-";

  const items = payload?.cuerpoDocumento || [];
  const resumen = payload?.resumen || {};

  const handlePrint = () => {
    window.print();
  };

  const handleDescargarJson = () => {
    const jsonStr = JSON.stringify(data.json_firmado || data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ERET-${codigoGeneracionEvento}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEnviarCorreo = async () => {
    if (!data?.id) return;
    const correoDefecto = dte.receptor_correo || "";
    const correoDestino = window.prompt(
      `Enviar Comprobante Oficial de Retorno al cliente:\n(UUID: ${codigoGeneracionEvento})\n\nIngrese o confirme el correo destinatario:`,
      correoDefecto
    );
    if (!correoDestino || !correoDestino.trim()) return;

    setEnviando(true);
    try {
      const res = await eventoService.enviarCorreoRetorno(data.id, correoDestino.trim());
      alert(res.data?.message || `Comprobante de Retorno enviado exitosamente a ${correoDestino}`);
    } catch (err) {
      alert("Error al enviar correo: " + (err.response?.data?.error || err.message));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* BARRA SUPERIOR DE ACCIONES */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ArrowUturnLeftIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Comprobante Oficial de Retorno (ERET)</h2>
              <p className="text-[11px] text-slate-400 font-mono">Evento Tipo 18 · Normativa DTE 2.0</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDescargarJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition cursor-pointer"
              title="Descargar JSON oficial firmado"
            >
              <DocumentArrowDownIcon className="w-4 h-4 text-emerald-400" />
              <span>JSON</span>
            </button>
            <button
              onClick={handleEnviarCorreo}
              disabled={enviando || !data?.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition shadow-xs cursor-pointer"
              title={`Enviar comprobante por correo a ${dte.receptor_correo || "cliente"}`}
            >
              {enviando ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin text-white" />
              ) : (
                <EnvelopeIcon className="w-4 h-4" />
              )}
              <span>{enviando ? "Enviando..." : "Email"}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-xs cursor-pointer"
            >
              <PrinterIcon className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENIDO DEL DOCUMENTO FISCAL (IMPRIMIBLE) */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-800 text-xs">
          {/* MEMBRETE FISCAL */}
          <div className="border-b border-slate-200 pb-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 mb-1">
                  República de El Salvador · Ministerio de Hacienda
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {emisor.nombre || "EMISOR CONTRIBUYENTE"}
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  {emisor.nombre_comercial ? `"${emisor.nombre_comercial}"` : ""}
                </p>
                <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                  <p><strong>NIT:</strong> {formatNit(emisor.nit)} | <strong>NRC:</strong> {emisor.nrc || "N/A"}</p>
                  <p><strong>Actividad Económica:</strong> {emisor.desc_actividad || "Servicios Comerciales"}</p>
                  <p><strong>Dirección:</strong> {emisor.direccion || emisor.complemento || "El Salvador"}</p>
                  <p><strong>Contacto:</strong> {emisor.telefono || "N/A"} · {emisor.correo || "N/A"}</p>
                </div>
              </div>

              {/* RECUADRO DE IDENTIFICACIÓN FISCAL DEL EVENTO */}
              <div className="w-full sm:w-80 bg-slate-50 border-2 border-emerald-600/60 rounded-xl p-3.5 space-y-1.5 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    EVENTO DE RETORNO (18)
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isAceptado ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
                  }`}>
                    <CheckBadgeIcon className="w-3.5 h-3.5" />
                    {estadoMh}
                  </span>
                </div>
                <div className="pt-1 border-t border-slate-200 text-[11px] space-y-1">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Código Generación (UUID):</span>
                    <span className="font-mono font-bold text-slate-900 break-all">{codigoGeneracionEvento}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Sello de Recepción MH:</span>
                    <span className="font-mono font-semibold text-emerald-700 break-all">{selloRecepcion}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Fecha y Hora de Emisión:</span>
                    <span className="font-medium text-slate-800">{fechaHoraEvento}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DTE ORIGINAL RELACIONADO */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
              Documento Tributario Electrónico de Origen (Vinculado)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-[11px]">
              <div>
                <span className="text-slate-500 block">Tipo de Documento:</span>
                <span className="font-semibold text-slate-800">{getTipoDteNombre(tipoDteRel)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Número de Control:</span>
                <span className="font-mono font-semibold text-slate-800">{numeroControlDte}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Código Generación Origen:</span>
                <span className="font-mono text-slate-700 break-all">{codigoGeneracionDte}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Fecha Emisión Original:</span>
                <span className="font-semibold text-slate-800">{fechaDteRel}</span>
              </div>
            </div>
          </div>

          {/* DATOS DEL CLIENTE / RECEPTOR Y MOTIVO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* RECEPTOR */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Datos del Receptor</h4>
              <p className="text-xs font-bold text-slate-900">{dte.receptor_nombre || "CONSUMIDOR FINAL"}</p>
              <p className="text-[11px] text-slate-600">
                <strong>Documento:</strong> {dte.receptor_documento || "N/A"}
              </p>
              <p className="text-[11px] text-slate-600">
                <strong>Correo:</strong> {dte.receptor_correo || "N/A"}
              </p>
              <p className="text-[11px] text-slate-600">
                <strong>Dirección:</strong> {dte.receptor_direccion || dte.receptor_complemento || "El Salvador"}
              </p>
            </div>

            {/* MOTIVO Y OBSERVACIÓN */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Motivo del Retorno</h4>
              <p className="text-xs font-semibold text-emerald-800">{getTipoRetornoTexto(data.tipo_retorno)}</p>
              <div className="pt-1 border-t border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Observaciones / Justificación:</span>
                <p className="text-[11px] text-slate-700 italic mt-0.5">
                  "{data.observacion || "Devolución de mercadería procesada sin invalidar el documento de origen."}"
                </p>
              </div>
            </div>
          </div>

          {/* TABLA DE ÍTEMS DEVUELTOS */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Detalle de Bienes / Mercadería Retornada
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full divide-y divide-slate-200">
                <thead className="bg-slate-100 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2 text-center w-12">#</th>
                    <th className="px-3 py-2 text-left">Descripción del Bien</th>
                    <th className="px-3 py-2 text-right w-24">Cantidad</th>
                    <th className="px-3 py-2 text-right w-24">Precio Unit.</th>
                    <th className="px-3 py-2 text-right w-24">Venta Gravada</th>
                    <th className="px-3 py-2 text-right w-24">IVA Ítem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {items.length > 0 ? (
                    items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="px-3 py-2 text-center text-slate-500 font-mono">{it.numItem || idx + 1}</td>
                        <td className="px-3 py-2 text-slate-800 font-medium">
                          {it.descripcion || "Producto retornado"}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-semibold text-slate-900">
                          {Number(it.cantidad || 0).toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-slate-700">
                          ${Number(it.precioUni || 0).toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-slate-800">
                          ${Number(it.ventaGravada || 0).toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-slate-600">
                          ${Number(it.ivaItem || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-4 text-center text-slate-500">
                        Detalle global de retorno por valor de ${Number(data.monto_retorno || 0).toFixed(2)} USD
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RESUMEN ECONÓMICO */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="w-full sm:w-1/2 bg-emerald-50/50 border border-emerald-200 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] text-emerald-800 uppercase block font-bold">Valor en Letras:</span>
              <p className="text-xs font-semibold text-emerald-950 uppercase">
                {resumen.totalLetras || "MONTO DE RETORNO PROCESADO"}
              </p>
              <p className="text-[10px] text-emerald-700 pt-1">
                ✔ Reingreso automático aplicado a Kardex con movimiento <code>ENTRADA_DEV_VENTA</code>.
              </p>
            </div>

            <div className="w-full sm:w-72 bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Ventas Retornadas:</span>
                <span className="font-mono">${Number(resumen.subTotalVentas || data.monto_retorno || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IVA (13%) Retornado:</span>
                <span className="font-mono">${Number(resumen.totalIva || 0).toFixed(2)}</span>
              </div>
              {Number(resumen.reteRenta || 0) > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Retención Renta:</span>
                  <span className="font-mono">-${Number(resumen.reteRenta).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1.5 border-t border-slate-300">
                <span>Monto Total Retornado:</span>
                <span className="font-mono text-emerald-700">${Number(resumen.totalPagar || data.monto_retorno || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* PIE DE PÁGINA LEGAL */}
          <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">
              DOCUMENTO ELECTRÓNICO OFICIAL DE RETORNO (ERET)
            </p>
            <p>
              Transmitido bajo el estándar JWS RS512 al Ministerio de Hacienda de El Salvador.
              Este documento sustenta la devolución o rebaja sin rescindir la validez jurídica del DTE original.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
