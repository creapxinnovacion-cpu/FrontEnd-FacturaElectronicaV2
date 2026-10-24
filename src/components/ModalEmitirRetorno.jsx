/**
 * FACT_V2 - Frontend Facturación Electrónica (El Salvador)
 *
 * Copyright (c) 2026 Creapx Innovación. Todos los derechos reservados.
 * Software propietario y confidencial de Creapx Innovación.
 * Prohibida su copia, distribución o modificación sin autorización expresa.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  XMarkIcon,
  ArrowUturnLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { eventoService } from "../services/api/evento.service";

export default function ModalEmitirRetorno({ open, onClose, dte, onSuccess }) {
  const [loadingPlazo, setLoadingPlazo] = useState(true);
  const [infoPlazo, setInfoPlazo] = useState(null);
  const [modalidad, setModalidad] = useState("TOTAL"); // "TOTAL" | "PARCIAL"
  const [itemsSeleccionados, setItemsSeleccionados] = useState({});
  const [tipoRetorno, setTipoRetorno] = useState(1);
  const [observacion, setObservacion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const cargarPlazo = useCallback(async (targetId = dte?.id) => {
    if (!targetId) return;
    setLoadingPlazo(true);
    setErrorMsg("");
    try {
      const res = await eventoService.consultarPlazoRetorno(targetId);
      const data = res.data;
      setInfoPlazo(data);

      // Inicializar selección de ítems
      const initialItems = {};
      (data.detalles || []).forEach((det) => {
        initialItems[det.id] = {
          detalle_id: det.id,
          descripcion: det.descripcion,
          cantidad_original: parseFloat(det.cantidad || 0),
          cantidad_retornar: parseFloat(det.cantidad || 0),
          precio_unitario: parseFloat(det.precio_unitario || 0),
          incluido: true,
        };
      });
      setItemsSeleccionados(initialItems);
    } catch (err) {
      console.error("Error al consultar plazo de retorno:", err);
      setErrorMsg(
        err.response?.data?.error || "No se pudo verificar el plazo legal del documento."
      );
    } finally {
      setLoadingPlazo(false);
    }
  }, [dte?.id]);

  useEffect(() => {
    if (open && dte?.id) {
      cargarPlazo(dte.id);
    }
  }, [open, dte?.id, cargarPlazo]);

  const handleToggleItem = (detId) => {
    setItemsSeleccionados((prev) => {
      const current = prev[detId];
      return {
        ...prev,
        [detId]: {
          ...current,
          incluido: !current.incluido,
        },
      };
    });
  };

  const handleCantidadChange = (detId, valor) => {
    const num = parseFloat(valor);
    setItemsSeleccionados((prev) => {
      const current = prev[detId];
      const max = current.cantidad_original;
      const cantValida = isNaN(num) ? 0 : Math.min(Math.max(0, num), max);
      return {
        ...prev,
        [detId]: {
          ...current,
          cantidad_retornar: cantValida,
        },
      };
    });
  };

  // Cálculos dinámicos
  const itemsArray = Object.values(itemsSeleccionados);
  let totalRetornar = 0;
  let totalIvaEstimado = 0;

  if (modalidad === "TOTAL") {
    totalRetornar = parseFloat(dte.total_pagar || 0);
    totalIvaEstimado = parseFloat(dte.total_iva || 0);
  } else {
    itemsArray.forEach((it) => {
      if (it.incluido && it.cantidad_retornar > 0) {
        const sub = it.cantidad_retornar * it.precio_unitario;
        totalRetornar += sub;
        // Para Factura 01, IVA ya viene incluido (sub / 1.13 * 0.13)
        if (String(dte.tipo_dte) === "1" || dte.tipo_dte === "01") {
          totalIvaEstimado += (sub / 1.13) * 0.13;
        } else {
          totalIvaEstimado += sub * 0.13;
        }
      }
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!observacion.trim() || observacion.trim().length < 5) {
      setErrorMsg("Debe ingresar una observación detallada del retorno (mínimo 5 caracteres).");
      return;
    }

    if (modalidad === "PARCIAL") {
      const itemsValidos = itemsArray.filter(
        (it) => it.incluido && it.cantidad_retornar > 0
      );
      if (itemsValidos.length === 0) {
        setErrorMsg("Debe seleccionar al menos un ítem con cantidad mayor a cero para retornar.");
        return;
      }
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        dte_id: dte.id,
        tipo_retorno: parseInt(tipoRetorno),
        observacion: observacion.trim(),
      };

      if (modalidad === "PARCIAL") {
        payload.items = itemsArray
          .filter((it) => it.incluido && it.cantidad_retornar > 0)
          .map((it) => ({
            detalle_id: it.detalle_id,
            cantidad: it.cantidad_retornar,
          }));
      }

      const res = await eventoService.procesarRetorno(payload);
      if (res.data.success) {
        onSuccess(res.data.retorno);
        onClose();
      } else {
        setErrorMsg(res.data.error || "Hacienda rechazó la recepción del retorno.");
      }
    } catch (err) {
      console.error("Error al procesar retorno:", err);
      const serverErr =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error de comunicación al firmar y transmitir el Evento de Retorno.";
      setErrorMsg(serverErr);
    } finally {
      setSubmitting(false);
    }
  };

  const plazo = infoPlazo?.plazo;
  const puedeRetornar = infoPlazo?.puede_retornar ?? true;

  if (!open || !dte) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* ENCABEZADO */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ArrowUturnLeftIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Emitir Evento de Retorno (ERET)</h2>
              <p className="text-xs text-slate-400">
                DTE: <span className="font-mono text-white font-semibold">{dte.numero_control || dte.codigo_generacion}</span> · Receptor: <span className="text-slate-200">{dte.receptor_nombre}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="overflow-y-auto p-6 space-y-5 text-slate-800 text-xs">
          {/* BANNER DE PLAZO LEGAL */}
          {loadingPlazo ? (
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500">
              <ArrowPathIcon className="w-4 h-4 animate-spin text-blue-500" />
              <span>Verificando plazo legal de 3 meses en base a normativa fiscal...</span>
            </div>
          ) : plazo ? (
            <div
              className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                plazo.es_valido
                  ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                  : "bg-red-50 border-red-200 text-red-900"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {plazo.es_valido ? (
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold text-xs">
                    {plazo.es_valido
                      ? `Plazo legal vigente (${plazo.dias_restantes} días restantes)`
                      : "Plazo legal vencido para este documento"}
                  </p>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    Emisión: {plazo.fecha_base} · Fecha límite para retorno:{" "}
                    <strong>{plazo.fecha_limite}</strong> ({plazo.regla})
                  </p>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                  plazo.es_valido
                    ? "bg-emerald-200 text-emerald-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                {plazo.es_valido ? "Habilitado" : "Expirado"}
              </span>
            </div>
          ) : null}

          {/* ALERTA DE ERROR */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-start gap-2">
              <ExclamationTriangleIcon className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <p className="text-xs">{errorMsg}</p>
            </div>
          )}

          {/* SELECTOR DE MODALIDAD */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Modalidad de Retorno
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setModalidad("TOTAL")}
                className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                  modalidad === "TOTAL"
                    ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-emerald-950 font-semibold"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div>
                  <p className="text-xs font-bold">Devolución Total</p>
                  <p className="text-[11px] text-slate-500">Retorna todos los ítems por ${parseFloat(dte.total_pagar).toFixed(2)}</p>
                </div>
                {modalidad === "TOTAL" && <CheckCircleIcon className="w-5 h-5 text-emerald-600" />}
              </button>

              <button
                type="button"
                onClick={() => setModalidad("PARCIAL")}
                className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                  modalidad === "PARCIAL"
                    ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-emerald-950 font-semibold"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div>
                  <p className="text-xs font-bold">Devolución Parcial</p>
                  <p className="text-[11px] text-slate-500">Seleccionar productos y cantidades específicas</p>
                </div>
                {modalidad === "PARCIAL" && <CheckCircleIcon className="w-5 h-5 text-emerald-600" />}
              </button>
            </div>
          </div>

          {/* TABLA DE ÍTEMS EN CASO PARCIAL */}
          {modalidad === "PARCIAL" && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Seleccione los Ítems y Cantidades a Retornar
              </label>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold text-[11px]">
                    <tr>
                      <th className="px-3 py-2 text-center w-10">Incluir</th>
                      <th className="px-3 py-2 text-left">Producto / Descripción</th>
                      <th className="px-3 py-2 text-center w-24">Cant. Orig.</th>
                      <th className="px-3 py-2 text-center w-32">Cant. Retorno</th>
                      <th className="px-3 py-2 text-right w-24">Precio Unit.</th>
                      <th className="px-3 py-2 text-right w-28">Subtotal Ret.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {itemsArray.map((it) => {
                      const sublinea = (it.cantidad_retornar * it.precio_unitario).toFixed(2);
                      return (
                        <tr
                          key={it.detalle_id}
                          className={`transition ${
                            it.incluido ? "bg-white" : "bg-slate-50/70 opacity-60"
                          }`}
                        >
                          <td className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={it.incluido}
                              onChange={() => handleToggleItem(it.detalle_id)}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                            />
                          </td>
                          <td className="px-3 py-2 font-medium text-slate-800">
                            {it.descripcion}
                          </td>
                          <td className="px-3 py-2 text-center font-mono text-slate-600">
                            {it.cantidad_original}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <input
                              type="number"
                              min="0"
                              max={it.cantidad_original}
                              step="any"
                              value={it.cantidad_retornar}
                              disabled={!it.incluido}
                              onChange={(e) =>
                                handleCantidadChange(it.detalle_id, e.target.value)
                              }
                              className="w-24 px-2 py-1 text-center font-mono font-bold rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 disabled:bg-slate-100"
                            />
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600">
                            ${it.precio_unitario.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                            ${sublinea}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MOTIVO Y OBSERVACIONES */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tipo de Retorno
              </label>
              <select
                value={tipoRetorno}
                onChange={(e) => setTipoRetorno(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value={1}>1 - Desperfecto / Error de mercadería</option>
                <option value={2}>2 - Rescisión parcial de la venta</option>
                <option value={3}>3 - Ajuste de precio o descuento posterior</option>
                <option value={4}>4 - Retorno de envases reutilizables</option>
                <option value={5}>5 - Devolución total de la operación</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Observación / Justificación Fiscal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Ej. Devolución de 1 producto por desperfecto reportado por el cliente"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* RESUMEN DE TOTALES E IMPACTO */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-start gap-2 text-slate-600">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Este evento <strong>no anula</strong> el DTE de origen. Se generará un mensaje oficial con <code>tipoEvento: 18</code> ante el MH y se registrará automáticamente la entrada de inventario <code>ENTRADA_DEV_VENTA</code> en Kardex.
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total a Retornar:</span>
              <span className="text-xl font-black font-mono text-emerald-700">
                ${totalRetornar.toFixed(2)} USD
              </span>
              <span className="block text-[10px] text-slate-400">
                IVA (13%) inc.: ~${totalIvaEstimado.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* FOOTER CON BOTÓN DE ENVÍO */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !puedeRetornar || totalRetornar <= 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition shadow-md shadow-emerald-900/10 cursor-pointer"
          >
            {submitting ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                <span>Firmando y Transmitiendo al MH...</span>
              </>
            ) : (
              <>
                <ArrowUturnLeftIcon className="w-4 h-4" />
                <span>Firmar y Transmitir Evento de Retorno</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
