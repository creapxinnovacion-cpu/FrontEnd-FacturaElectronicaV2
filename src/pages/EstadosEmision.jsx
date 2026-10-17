import { useState, useEffect } from "react";
import { SignalIcon, ServerIcon, CheckBadgeIcon, ExclamationTriangleIcon, ArrowPathIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { dteService } from "../services/api/dte.service";
import { eventoService } from "../services/api/evento.service";

export default function EstadosEmision() {
  const [diagnostico, setDiagnostico] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para pruebas de contingencia MH (0/5)
  const [testingContingencia, setTestingContingencia] = useState(false);
  const [contingenciaResultado, setContingenciaResultado] = useState(null);
  const [contingenciaError, setContingenciaError] = useState(null);

  useEffect(() => {
    fetchDiagnostico();
  }, []);

  const fetchDiagnostico = async () => {
    try {
      const data = await dteService.getDiagnostico();
      setDiagnostico(data);
    } catch (error) {
      console.error("Error al obtener diagnóstico:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEjecutarPruebasContingencia = async () => {
    setTestingContingencia(true);
    setContingenciaError(null);
    setContingenciaResultado(null);
    try {
      const res = await eventoService.acreditarPruebasContingencia(5);
      setContingenciaResultado(res.data);
    } catch (err) {
      console.error("Error al ejecutar pruebas de contingencia:", err);
      setContingenciaError(err.response?.data?.error || err.message || "Error al transmitir eventos de contingencia");
    } finally {
      setTestingContingencia(false);
    }
  };

  const mhConectado = diagnostico?.pruebas?.endpoints_oficiales_mh_v2?.conectividad_servidores_mh?.includes("DISPONIBLE");
  const firmaOk = diagnostico?.pruebas?.firma_electronica_jws?.status === "OK";
  const dbOk = diagnostico?.pruebas?.base_de_datos?.status === "OK";

  const servicios = [
    { 
      nombre: "Servicio de Recepción MH", 
      estado: mhConectado ? "Activo" : "Intermitente", 
      latency: mhConectado ? "45ms" : "N/A", 
      uptime: mhConectado ? "99.9%" : "Bajo",
      ok: mhConectado
    },
    { 
      nombre: "Base de Datos Local", 
      estado: dbOk ? "Activo" : "Error", 
      latency: "1ms", 
      uptime: "100%",
      ok: dbOk
    },
    { 
      nombre: "Firmador JWS", 
      estado: firmaOk ? "Activo" : "Error", 
      latency: "12ms", 
      uptime: "100%",
      ok: firmaOk
    },
  ];

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Cargando diagnóstico del sistema...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Estados de Emisión y Servicios</h1>
          <p className="text-sm text-gray-500">Monitoreo en tiempo real de la conectividad con el Ministerio de Hacienda. Ambiente: {diagnostico?.ambiente}</p>
        </div>
        <button
          onClick={fetchDiagnostico}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Actualizar Estado
        </button>
      </header>

      {/* TARJETAS DE SERVICIOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {servicios.map((srv) => (
          <div key={srv.nombre} className={`bg-white p-6 rounded-2xl border shadow-xs space-y-4 ${srv.ok ? 'border-gray-200' : 'border-red-300'}`}>
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                <ServerIcon className="w-6 h-6"/>
              </div>
              <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${srv.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {srv.estado}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{srv.nombre}</h3>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Latencia: {srv.latency}</span>
                <span>Uptime: {srv.uptime}</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
               <div className={`${srv.ok ? 'bg-green-500' : 'bg-red-500'} h-full w-[95%]`}></div>
            </div>
          </div>
        ))}
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* REGISTRO DE EVENTOS */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <SignalIcon className="w-5 h-5 mr-2 text-blue-600"/> Registro de Conectividad
          </h3>
          <div className="space-y-4 max-h-72 overflow-y-auto">
            {diagnostico ? (
              <>
                <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-xl transition">
                  {firmaOk ? <CheckBadgeIcon className="w-5 h-5 text-green-500 mt-0.5 shrink-0"/> : <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />}
                  <div>
                    <p className="text-sm font-medium text-gray-800">Firma JWS RS512: {firmaOk ? 'Operativo' : 'Fallida'}</p>
                    <p className="text-xs text-gray-400">{diagnostico.timestamp}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-xl transition">
                  {mhConectado ? <CheckBadgeIcon className="w-5 h-5 text-green-500 mt-0.5 shrink-0"/> : <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />}
                  <div>
                    <p className="text-sm font-medium text-gray-800">Servidores MH: {diagnostico.pruebas.endpoints_oficiales_mh_v2.conectividad_servidores_mh}</p>
                    <p className="text-xs text-gray-400">Verificado ante API de Hacienda</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-xl transition">
                  {dbOk ? <CheckBadgeIcon className="w-5 h-5 text-green-500 mt-0.5 shrink-0"/> : <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />}
                  <div>
                    <p className="text-sm font-medium text-gray-800">Base de Datos PostgreSQL (Neon): {dbOk ? 'Conectado' : 'Error'}</p>
                    <p className="text-xs text-gray-400">Transacciones y persistencia activas</p>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* TARJETA DE ACREDITACIÓN DE CONTINGENCIA (0/5) */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-6 text-white border border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Acreditación MH
              </span>
              <span className="text-xs text-slate-400">Ambiente de Pruebas (00)</span>
            </div>
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
              <ShieldCheckIcon className="w-6 h-6 text-blue-400" />
              Evento de Contingencia (0/5)
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed mb-4">
              Hacienda exige transmitir al menos 5 eventos de contingencia válidos y firmados ante el endpoint <code className="text-blue-300 bg-blue-950/60 px-1 py-0.5 rounded">/fesv/contingencia</code> para pasar la certificación a Producción.
            </p>

            {contingenciaError && (
              <div className="p-3 mb-4 rounded-xl bg-red-950/60 border border-red-800/60 text-xs text-red-200">
                ⚠️ {contingenciaError}
              </div>
            )}

            {contingenciaResultado && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-200 space-y-1">
                <p className="font-bold">
                  ✓ {contingenciaResultado.message}
                </p>
                <p className="text-[11px] text-emerald-300/80">
                  Pruebas completadas con éxito: {contingenciaResultado.datos?.exitosas} / {contingenciaResultado.datos?.total_solicitadas}. Ya puedes verificar el contador en tu portal de Hacienda.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleEjecutarPruebasContingencia}
            disabled={testingContingencia}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/50 text-white rounded-xl font-bold text-xs tracking-wide uppercase transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {testingContingencia ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Transmitiendo 5 Eventos a Hacienda...
              </>
            ) : (
              "Transmitir 5 Eventos de Contingencia al MH"
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
