import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import EstadoConexion from "../components/EstadoConexion";
import ResumenCard from "../components/ResumenCard";
import ListaDocumentos from "../components/ListaDocumentos";
import { batchService } from "../services/api/batch.service";

export default function Home() {
  const [conexion, setConexion] = useState("online");
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
      const response = await batchService.getAll();
      const docs = response.data.map(d => ({
        id: d.id,
        nombre: `${d.numero_control} - ${d.receptor_nombre}`,
        estado: d.estado_actual,
        seleccionado: false,
      }));
      setDocumentos(docs);
    } catch (error) {
      console.error("Error al cargar documentos", error);
    } finally {
      setLoading(false);
    }
  };

  const pendientes = documentos.filter(d => d.estado === 'REGISTRADO').length;
  const firmados = documentos.filter(d => d.estado === 'FIRMADO').length;
  const rechazados = documentos.filter(d => d.estado === 'RECHAZADO').length;

  const enviarLote = async () => {
    const seleccionados = documentos.filter((d) => d.seleccionado);
    if (seleccionados.length === 0) {
      setMensajeEnvio("Selecciona al menos un documento.");
      return;
    }

    setEnviando(true);
    setMensajeEnvio("");

    // Aquí iría la lógica de envío masivo a Hacienda en el futuro
    setTimeout(() => {
      setMensajeEnvio("Funcionalidad de envío masivo en desarrollo.");
      setEnviando(false);
    }, 1500);
  };

  return (
    <div className="px-4 py-6 md:px-8 lg:px-10 space-y-8 max-w-7xl mx-auto">
      {/* ===== ESTADO DEL SISTEMA ===== */}
      <section className="bg-white rounded-2xl shadow-sm border p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Estado del sistema</h2>
          <p className="text-sm text-gray-500">Conectividad con MH y firmador local</p>
        </div>
        <EstadoConexion estado={conexion} />
      </section>

      {/* ===== RESUMEN ===== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ResumenCard
          titulo="Pendientes de firma"
          valor={pendientes}
          color="orange"
          icon={<ClockIcon className="w-6 h-6" />}
        />
        <ResumenCard
          titulo="Firmados exitosamente"
          valor={firmados}
          color="green"
          icon={<CheckCircleIcon className="w-6 h-6" />}
        />
        <ResumenCard
          titulo="Rechazados"
          valor={rechazados}
          color="red"
          icon={<XCircleIcon className="w-6 h-6" />}
        />
      </section>

      {/* ===== LISTADO ===== */}
      <section className="bg-white rounded-2xl shadow-sm border p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-800">📦 Documentos en el sistema</h2>
          <button
            onClick={enviarLote}
            disabled={enviando || documentos.length === 0}
            className={`inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-medium transition ${enviando ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
          >
            {enviando ? "Procesando..." : "ENVIAR A HACIENDA"}
          </button>
        </div>

        {mensajeEnvio && (
          <p className={`text-sm font-medium ${mensajeEnvio.includes("Error") ? "text-red-600" : "text-blue-600"}`}>
            {mensajeEnvio}
          </p>
        )}

        {loading ? (
          <p className="text-center py-10 text-gray-500">Cargando documentos...</p>
        ) : (
          <ListaDocumentos documentos={documentos} setDocumentos={setDocumentos} />
        )}
      </section>
    </div>
  );
}
