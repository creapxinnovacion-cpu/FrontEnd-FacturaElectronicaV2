import { useState, useEffect } from "react";
import { SignalIcon, ServerIcon, CheckBadgeIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { dteService } from "@/services/api/dte.service";

export default function EstadosEmision() {
  const [diagnostico, setDiagnostico] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchDiagnostico();
  }, []);

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
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Estados de Emisión y Servicios</h1>
        <p className="text-sm text-gray-500">Monitoreo en tiempo real de la conectividad con el Ministerio de Hacienda. Ambiente: {diagnostico?.ambiente}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {servicios.map((srv) => (
          <div key={srv.nombre} className={`bg-white p-6 rounded-2xl border shadow-sm space-y-4 ${srv.ok ? 'border-gray-200' : 'border-red-300'}`}>
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
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <SignalIcon className="w-5 h-5 mr-2 text-blue-600"/> Registro de Eventos
          </h3>
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {diagnostico ? (
              <>
                <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-xl transition">
                  {firmaOk ? <CheckBadgeIcon className="w-5 h-5 text-green-500 mt-0.5"/> : <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5" />}
                  <div>
                    <p className="text-sm font-medium text-gray-800">Firma JWS: {firmaOk ? 'Exitosa' : 'Fallida'}</p>
                    <p className="text-xs text-gray-400">{diagnostico.timestamp}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-xl transition">
                  {mhConectado ? <CheckBadgeIcon className="w-5 h-5 text-green-500 mt-0.5"/> : <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5" />}
                  <div>
                    <p className="text-sm font-medium text-gray-800">Conexión MH: {diagnostico.pruebas.endpoints_oficiales_mh_v2.conectividad_servidores_mh}</p>
                    <p className="text-xs text-gray-400">Verificado hace un momento</p>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="bg-blue-600 rounded-2xl p-8 text-white flex flex-col justify-between">
           <div>
              <h3 className="text-xl font-bold mb-2">¿Problemas de conexión?</h3>
              <p className="text-blue-100 text-sm mb-6">Si el servicio de Hacienda presenta intermitencia, el sistema activará automáticamente el modo de contingencia.</p>
           </div>
           <button className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition">
              VER GUÍA DE CONTINGENCIA
           </button>
        </div>
      </section>
    </div>
  );
}
