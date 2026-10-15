import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

import EstadoConexion from "../components/EstadoConexion";
import ResumenCard from "../components/ResumenCard";
import ListaDocumentos from "../components/ListaDocumentos";
import { batchService } from "../services/api/batch.service";
import { db } from "../services/db";

export default function Home() {
  const [conexion, _setConexion] = useState("online");
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensajeEnvio, setMensajeEnvio] = useState("");

  useEffect(() => {
    loadDocumentos();
    const interval = setInterval(loadDocumentos, 30000); // Recarga cada 30s
    return () => clearInterval(interval);
  }, []);

  const loadDocumentos = async () => {
    try {
      // 1. Cargar documentos del backend
      const response = await batchService.getAll();
      const docsBackend = response.data.map((d) => ({
        id: d.id,
        nombre: `${d.numero_control} - ${d.receptor_nombre}`,
        estado: d.estado_actual,
        seleccionado: false,
        isOffline: false,
      }));

      // 2. Cargar documentos Offline de IndexedDB (Caída Nivel 1)
      const offlineDocsRaw = await db.offlineDocs.toArray();
      const docsOffline = offlineDocsRaw.map((d) => ({
        id: d.id,
        nombre: `Borrador Local - ${d.receptor_nombre}`,
        estado: d.estado,
        seleccionado: false,
        isOffline: true,
        payloadOriginal: d.payloadOriginal,
      }));

      setDocumentos([...docsOffline, ...docsBackend]);
    } catch (error) {
      console.error("Error al cargar documentos", error);

      // Si falla la carga del backend, mostramos al menos los offline de Dexie
      try {
        const offlineDocsRaw = await db.offlineDocs.toArray();
        if (offlineDocsRaw.length > 0) {
          setDocumentos(
            offlineDocsRaw.map((d) => ({
              id: d.id,
              nombre: `Borrador Local - ${d.receptor_nombre}`,
              estado: d.estado,
              seleccionado: false,
              isOffline: true,
              payloadOriginal: d.payloadOriginal,
            }))
          );
        }
      } catch (errDb) {
        console.error("Error cargando DB local", errDb);
      }
    } finally {
      setLoading(false);
    }
  };

  const pendientes = documentos.filter(
    (d) => d.estado === "REGISTRADO" || d.isOffline
  ).length;
  const firmados = documentos.filter(
    (d) => d.estado === "FIRMADO" || d.estado === "ACEPTADO"
  ).length;
  const rechazados = documentos.filter((d) => d.estado === "RECHAZADO").length;

  const enviarLote = async () => {
    const seleccionados = documentos.filter((d) => d.seleccionado);
    if (seleccionados.length === 0) {
      setMensajeEnvio("Selecciona al menos un documento para transmitir.");
      return;
    }

    setEnviando(true);
    setMensajeEnvio(
      `Iniciando envío/sincronización de ${seleccionados.length} documentos...`
    );

    let exitosos = 0;
    let fallidos = 0;

    for (const doc of seleccionados) {
      try {
        if (doc.isOffline) {
          // Si es offline, se crea por primera vez en el backend
          await batchService.create(doc.payloadOriginal);

          // Si fue exitoso, lo eliminamos de IndexedDB
          await db.offlineDocs.delete(doc.id);

          exitosos++;
        } else {
          // Si es un documento del backend, solo pedimos retransmitirlo
          await batchService.transmitir(doc.id);
          exitosos++;
        }
      } catch (error) {
        console.error(`Error procesando documento ${doc.id}:`, error);
        fallidos++;
      }
    }

    setEnviando(false);
    setMensajeEnvio(
      `Proceso completado: ${exitosos} exitosos, ${fallidos} fallidos.`
    );

    // Recargar la lista para reflejar los nuevos estados
    loadDocumentos();
  };

  const toggleSelectAll = () => {
    const todosSeleccionados =
      documentos.length > 0 && documentos.every((d) => d.seleccionado);
    setDocumentos((prev) =>
      prev.map((d) => ({ ...d, seleccionado: !todosSeleccionados }))
    );
  };

  const seleccionadosCount = documentos.filter((d) => d.seleccionado).length;

  return (
    <main className="min-h-screen bg-slate-50/60 pb-16">
      <div className="px-4 py-8 md:px-8 lg:px-10 space-y-8 max-w-7xl mx-auto">
        {/* ===== HEADER & ESTADO DEL SISTEMA ===== */}
        <header className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                Consola de Facturación y Transmisión
              </h1>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                DTE SV v2
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Monitoreo en tiempo real de emisión fiscal, cola de contingencia y sincronización con MH.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => {
                setLoading(true);
                loadDocumentos();
              }}
              disabled={loading}
              title="Actualizar datos"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <ArrowPathIcon
                className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`}
              />
              <span className="hidden sm:inline">Refrescar</span>
            </button>
            <EstadoConexion estado={conexion} />
          </div>
        </header>

        {/* ===== RESUMEN DE METRICAS ===== */}
        <section aria-label="Métricas del sistema" className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <ResumenCard
            titulo="Pendientes / Cola"
            valor={pendientes}
            color="orange"
            icon={<ClockIcon className="w-6 h-6 text-amber-600" />}
          />
          <ResumenCard
            titulo="Firmados / Aceptados"
            valor={firmados}
            color="green"
            icon={<CheckCircleIcon className="w-6 h-6 text-emerald-600" />}
          />
          <ResumenCard
            titulo="Rechazos MH"
            valor={rechazados}
            color="red"
            icon={<XCircleIcon className="w-6 h-6 text-rose-600" />}
          />
        </section>

        {/* ===== BANNER INFORMATIVO COLA OFFLINE (SI EXISTE) ===== */}
        {documentos.some((d) => d.isOffline) && (
          <aside className="bg-amber-50/80 border border-amber-300/80 text-amber-900 px-5 py-4 rounded-xl flex items-start gap-3 shadow-2xs">
            <InformationCircleIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-0.5">
              <p className="font-semibold text-amber-950">
                Documentos en Cola Local (Modo Contingencia / Offline)
              </p>
              <p className="text-amber-800 text-xs">
                Existen comprobantes guardados en almacenamiento local del navegador. Seleccione los borradores y presione <strong>Transmitir a Hacienda</strong> cuando se restablezca la conexión.
              </p>
            </div>
          </aside>
        )}

        {/* ===== LISTADO DE DOCUMENTOS Y ACCION EN LOTE ===== */}
        <section className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Documentos Registrados
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {documentos.length} total
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {documentos.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {documentos.every((d) => d.seleccionado)
                    ? "Deseleccionar todos"
                    : "Seleccionar todos"}
                </button>
              )}

              <button
                onClick={enviarLote}
                disabled={enviando || documentos.length === 0}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer ${
                  enviando || documentos.length === 0
                    ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 active:scale-[0.98]"
                }`}
              >
                {enviando ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-4 h-4" />
                    <span>
                      Transmitir a Hacienda {seleccionadosCount > 0 ? `(${seleccionadosCount})` : ""}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {mensajeEnvio && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 border ${
                mensajeEnvio.includes("Error") || mensajeEnvio.includes("fallidos")
                  ? "bg-rose-50 text-rose-800 border-rose-200"
                  : "bg-blue-50 text-blue-800 border-blue-200"
              }`}
            >
              <InformationCircleIcon className="w-4 h-4 flex-shrink-0" />
              <span>{mensajeEnvio}</span>
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center space-y-3">
              <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              <p className="text-sm font-medium text-slate-500">
                Sincronizando registros con el servidor...
              </p>
            </div>
          ) : (
            <ListaDocumentos documentos={documentos} setDocumentos={setDocumentos} />
          )}
        </section>
      </div>
    </main>
  );
}
