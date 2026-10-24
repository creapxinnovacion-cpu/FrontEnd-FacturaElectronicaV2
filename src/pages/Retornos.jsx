import React, { useState, useEffect } from "react";
import {
  ArrowUturnLeftIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PrinterIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EnvelopeIcon
} from "@heroicons/react/24/outline";
import { batchService } from "../services/api/batch.service";
import { eventoService } from "../services/api/evento.service";
import ModalEmitirRetorno from "../components/ModalEmitirRetorno";
import ModalGraficaRetorno from "../components/ModalGraficaRetorno";

export default function Retornos() {
  const [activeTab, setActiveTab] = useState("HISTORIAL"); // "HISTORIAL" | "ELEGIBLES"
  const [retornos, setRetornos] = useState([]);
  const [dtes, setDtes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [alerta, setAlerta] = useState({ tipo: "", mensaje: "" });

  // Modales
  const [modalEmitirOpen, setModalEmitirOpen] = useState(false);
  const [selectedDte, setSelectedDte] = useState(null);

  const [modalGraficaOpen, setModalGraficaOpen] = useState(false);
  const [selectedRetorno, setSelectedRetorno] = useState(null);
  const [enviandoId, setEnviandoId] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setAlerta({ tipo: "", mensaje: "" });
    try {
      const [resRetornos, resDtes] = await Promise.all([
        eventoService.getRetornos(),
        batchService.getAll(),
      ]);

      const listaRetornos = resRetornos.data || [];
      const listaDtes = resDtes.data || [];

      setRetornos(Array.isArray(listaRetornos) ? listaRetornos : []);
      setDtes(Array.isArray(listaDtes) ? listaDtes : []);
    } catch (err) {
      console.error("Error al cargar datos de retorno:", err);
      setAlerta({
        tipo: "error",
        mensaje: "No se pudieron obtener los retornos o DTEs desde el servidor.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEmitir = (dte) => {
    setSelectedDte(dte);
    setModalEmitirOpen(true);
  };

  const handleRetornoExitoso = (nuevoRetorno) => {
    setAlerta({
      tipo: "success",
      mensaje: `Evento de Retorno emitido con éxito. UUID: ${nuevoRetorno.codigo_generacion}`,
    });
    setSelectedRetorno(nuevoRetorno);
    setModalGraficaOpen(true);
    cargarDatos();
  };

  const handleVerGrafica = (retorno) => {
    setSelectedRetorno(retorno);
    setModalGraficaOpen(true);
  };

  const handleEnviarCorreo = async (retorno) => {
    const correoDefecto = retorno.dte?.receptor_correo || "";
    const correoDestino = window.prompt(
      `Enviar Comprobante Oficial de Retorno al cliente:\n(UUID: ${retorno.codigo_generacion})\n\nIngrese o confirme el correo destinatario:`,
      correoDefecto
    );

    if (!correoDestino || !correoDestino.trim()) return;

    setEnviandoId(retorno.id);
    setAlerta({ tipo: "", mensaje: "" });

    try {
      const res = await eventoService.enviarCorreoRetorno(retorno.id, correoDestino.trim());
      setAlerta({
        tipo: "success",
        mensaje: res.data?.message || `Comprobante de Retorno enviado exitosamente a ${correoDestino}`,
      });
    } catch (err) {
      console.error("Error al enviar comprobante de retorno:", err);
      const msg = err.response?.data?.error || err.message || "Error al enviar correo.";
      setAlerta({
        tipo: "error",
        mensaje: `No se pudo enviar el correo: ${msg}`,
      });
    } finally {
      setEnviandoId(null);
    }
  };

  // Filtrado de DTEs elegibles (01, 11, 14 que no estén ANULADOS)
  const dtesElegibles = dtes.filter((d) => {
    const tipo = String(d.tipo_dte || "").padStart(2, "0");
    const esTipoElegible = ["01", "11", "14"].includes(tipo);
    const noAnulado = d.estado_actual !== "ANULADO";
    return esTipoElegible && noAnulado;
  });

  // Métricas
  const totalRetornosCount = retornos.length;
  const montoTotalRetornado = retornos.reduce(
    (acc, r) => acc + parseFloat(r.monto_retorno || 0),
    0
  );
  const retornosAprobados = retornos.filter(
    (r) => r.estado_actual === "ACEPTADO" || r.respuesta_mh?.estado === "PROCESADO"
  ).length;

  // Filtro de búsqueda en la tabla activa
  const retornosFiltrados = retornos.filter((r) => {
    const q = busqueda.toLowerCase();
    const codGen = (r.codigo_generacion || "").toLowerCase();
    const receptor = (r.dte?.receptor_nombre || "").toLowerCase();
    const control = (r.dte?.numero_control || "").toLowerCase();
    const sello = (r.sello_recepcion || "").toLowerCase();
    return codGen.includes(q) || receptor.includes(q) || control.includes(q) || sello.includes(q);
  });

  const elegiblesFiltrados = dtesElegibles.filter((d) => {
    const q = busqueda.toLowerCase();
    const codGen = (d.codigo_generacion || "").toLowerCase();
    const receptor = (d.receptor_nombre || "").toLowerCase();
    const control = (d.numero_control || "").toLowerCase();
    return codGen.includes(q) || receptor.includes(q) || control.includes(q);
  });

  // Helper para días restantes de 3 meses
  const calcularDiasRestantes = (fechaEmision) => {
    if (!fechaEmision) return 0;
    const emi = new Date(fechaEmision.split("T")[0]);
    const limite = new Date(emi);
    limite.setMonth(limite.getMonth() + 3);
    const hoy = new Date();
    const diffTime = limite - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* HEADER DE LA PÁGINA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <ArrowUturnLeftIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Eventos de Retorno (ERET)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Normativa DTE 2.0 · Mensaje oficial tipo <code>18</code> para devoluciones y reingresos a inventario
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab("ELEGIBLES");
              window.scrollTo({ top: 300, behavior: "smooth" });
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-sm cursor-pointer"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Emitir Nuevo Retorno</span>
          </button>
          <button
            onClick={cargarDatos}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Recargar datos"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ALERTAS */}
      {alerta.mensaje && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
            alerta.tipo === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {alerta.tipo === "success" ? (
              <CheckBadgeIcon className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <p className="text-xs font-medium">{alerta.mensaje}</p>
          </div>
          <button
            onClick={() => setAlerta({ tipo: "", mensaje: "" })}
            className="text-xs font-bold opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* CARDS DE MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Retornos Emitidos
          </span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {totalRetornosCount}
            </span>
            <span className="text-xs text-slate-500">mensajes</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Valor Retornado
          </span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-black text-emerald-700 font-mono">
              ${montoTotalRetornado.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500">USD</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Aprobación Hacienda
          </span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {totalRetornosCount > 0
                ? `${Math.round((retornosAprobados / totalRetornosCount) * 100)}%`
                : "100%"}
            </span>
            <span className="text-xs text-emerald-600 font-medium">con Sello MH</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            DTEs Elegibles Activos
          </span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-black text-blue-700 font-mono">
              {dtesElegibles.length}
            </span>
            <span className="text-xs text-slate-500">Facturas 01/11/14</span>
          </div>
        </div>
      </div>

      {/* TABS Y BUSCADOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("HISTORIAL")}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 ${
              activeTab === "HISTORIAL"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Historial de Retornos ({retornos.length})
          </button>
          <button
            onClick={() => setActiveTab("ELEGIBLES")}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 ${
              activeTab === "ELEGIBLES"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            DTEs Elegibles para Retorno ({dtesElegibles.length})
          </button>
        </div>

        <div className="relative pb-2 sm:pb-0">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por UUID, control, receptor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 w-full sm:w-64 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
          />
        </div>
      </div>

      {/* TAB 1: HISTORIAL DE RETORNOS */}
      {activeTab === "HISTORIAL" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Fecha Evento</th>
                  <th className="px-5 py-3.5">Código Generación (UUID)</th>
                  <th className="px-5 py-3.5">DTE Original</th>
                  <th className="px-5 py-3.5">Receptor</th>
                  <th className="px-5 py-3.5 text-right">Monto Devuelto</th>
                  <th className="px-5 py-3.5 text-center">Estado MH</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-10 text-center text-slate-500">
                      <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
                      Cargando historial de eventos de retorno...
                    </td>
                  </tr>
                ) : retornosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-12 text-center text-slate-500">
                      <ArrowUturnLeftIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-700">No se encontraron eventos de retorno</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Puedes registrar una devolución seleccionando una Factura en la pestaña "DTEs Elegibles".
                      </p>
                    </td>
                  </tr>
                ) : (
                  retornosFiltrados.map((ret) => {
                    const isProc =
                      ret.estado_actual === "ACEPTADO" ||
                      ret.respuesta_mh?.estado === "PROCESADO";
                    return (
                      <tr key={ret.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-700">
                          {ret.created_at
                            ? new Date(ret.created_at).toLocaleDateString("es-SV", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap font-mono text-[11px] font-semibold text-slate-800">
                          {ret.codigo_generacion}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="font-mono text-xs font-semibold text-slate-800 block">
                            {ret.dte?.numero_control || "DTE"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {ret.dte?.codigo_generacion?.substring(0, 18)}...
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-800 font-medium">
                          {ret.dte?.receptor_nombre || "CONSUMIDOR FINAL"}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-right font-mono font-bold text-emerald-700">
                          ${parseFloat(ret.monto_retorno || 0).toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isProc
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            <CheckBadgeIcon className="w-3 h-3" />
                            {isProc ? "Aprobado MH" : ret.estado_actual || "Firmado"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-right space-x-2">
                          <button
                            onClick={() => handleVerGrafica(ret)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                            title="Ver Comprobante Oficial de Retorno"
                          >
                            <DocumentTextIcon className="w-4 h-4" />
                            <span>Comprobante</span>
                          </button>

                          <button
                            onClick={() => handleEnviarCorreo(ret)}
                            disabled={enviandoId === ret.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 transition cursor-pointer"
                            title={`Enviar Comprobante Oficial de Retorno a ${ret.dte?.receptor_correo || "cliente"}`}
                          >
                            {enviandoId === ret.id ? (
                              <ArrowPathIcon className="w-4 h-4 animate-spin text-indigo-600" />
                            ) : (
                              <EnvelopeIcon className="w-4 h-4" />
                            )}
                            <span>{enviandoId === ret.id ? "Enviando..." : "Email"}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DTES ELEGIBLES PARA RETORNO */}
      {activeTab === "ELEGIBLES" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <p className="text-xs text-slate-600">
              Documentos tipo Factura (<code>01</code>), Exportación (<code>11</code>) y Sujeto Excluido (<code>14</code>) en estado <strong>ACEPTADO</strong> dentro del plazo de 3 meses.
            </p>
            <span className="text-[11px] font-mono text-slate-500 font-semibold">
              {elegiblesFiltrados.length} encontrados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Emisión</th>
                  <th className="px-5 py-3.5">Número Control</th>
                  <th className="px-5 py-3.5">Tipo DTE</th>
                  <th className="px-5 py-3.5">Receptor</th>
                  <th className="px-5 py-3.5 text-right">Total Factura</th>
                  <th className="px-5 py-3.5 text-center">Plazo Retorno (3m)</th>
                  <th className="px-5 py-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {elegiblesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-10 text-center text-slate-500">
                      No hay DTEs elegibles disponibles.
                    </td>
                  </tr>
                ) : (
                  elegiblesFiltrados.map((dte) => {
                    const dias = calcularDiasRestantes(dte.fecha_emision);
                    const estaVigente = dias > 0;
                    return (
                      <tr key={dte.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-700">
                          {dte.fecha_emision?.split("T")[0]} {dte.hora_emision}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap font-mono font-semibold text-slate-800">
                          {dte.numero_control}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                            {String(dte.tipo_dte) === "1" || dte.tipo_dte === "01"
                              ? "Factura (01)"
                              : dte.tipo_dte === "11"
                              ? "Exportación (11)"
                              : "Sujeto Excl. (14)"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-800 font-medium">
                          {dte.receptor_nombre}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-right font-mono font-bold text-slate-900">
                          ${parseFloat(dte.total_pagar).toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              estaVigente
                                ? dias > 15
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            <ClockIcon className="w-3.5 h-3.5" />
                            {estaVigente ? `${dias} días restantes` : "Plazo vencido"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleOpenEmitir(dte)}
                            disabled={!estaVigente}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer"
                          >
                            <ArrowUturnLeftIcon className="w-3.5 h-3.5" />
                            <span>Retornar</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL PARA EMITIR RETORNO */}
      {modalEmitirOpen && (
        <ModalEmitirRetorno
          open={modalEmitirOpen}
          onClose={() => setModalEmitirOpen(false)}
          dte={selectedDte}
          onSuccess={handleRetornoExitoso}
        />
      )}

      {/* MODAL PARA VER COMPROBANTE GRÁFICO OFICIAL */}
      {modalGraficaOpen && (
        <ModalGraficaRetorno
          open={modalGraficaOpen}
          onClose={() => setModalGraficaOpen(false)}
          data={selectedRetorno}
        />
      )}
    </div>
  );
}
