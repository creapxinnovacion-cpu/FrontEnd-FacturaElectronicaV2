import { ChartBarIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export default function Reportes() {
  const reportes = [
    { id: 1, nombre: "Ventas por Periodo", desc: "Resumen detallado de ingresos por fechas.", icon: <ChartBarIcon className="w-6 h-6"/> },
    { id: 2, nombre: "Reporte de Impuestos", desc: "Cálculo de IVA y retenciones para Hacienda.", icon: <ArrowDownTrayIcon className="w-6 h-6"/> },
    { id: 3, nombre: "Documentos Emitidos", desc: "Listado completo de DTEs y sus estados.", icon: <ChartBarIcon className="w-6 h-6"/> },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Centro de Reportes</h1>
        <p className="text-gray-500 text-sm">Analiza el rendimiento de tu negocio y exporta datos fiscales.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportes.map((rep) => (
          <div key={rep.id} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition group cursor-pointer">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
              {rep.icon}
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">{rep.nombre}</h3>
            <p className="text-sm text-gray-500 mb-4">{rep.desc}</p>
            <button className="text-blue-600 text-sm font-bold flex items-center hover:underline">
              GENERAR AHORA →
            </button>
          </div>
        ))}
      </div>

      <section className="bg-white rounded-2xl border shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-6">Actividad Reciente</h3>
        <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
           <p className="text-gray-400 text-sm italic">[ Gráfico de Tendencias en Desarrollo ]</p>
        </div>
      </section>
    </div>
  );
}
