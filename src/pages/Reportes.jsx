import { useState, useEffect, useCallback } from "react";
import { ChartBarIcon, ArrowDownTrayIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { reporteService } from "../services/api/reporte.service";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Reportes() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const mesActual = new Date().getMonth() + 1;
  const anioActual = new Date().getFullYear();
  const [mes, setMes] = useState(mesActual);
  const [anio, setAnio] = useState(anioActual);

  const cargarDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reporteService.getDashboard(mes, anio);
      setData(res.data);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [mes, anio]);

  useEffect(() => {
    cargarDashboard();
  }, [cargarDashboard]);

  const handleDescargar = (tipo) => {
    window.location.href = `http://localhost:8000/api/libros-iva/${tipo}?mes=${mes}&anio=${anio}&formato=pdf`;
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Cargando reportes...</div>;
  }

  const { impuestos, ventas_periodo, documentos_emitidos, actividad_reciente } = data || {};

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Centro de Reportes</h1>
          <p className="text-gray-500 text-sm">Analiza el rendimiento de tu negocio y exporta datos fiscales.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border shadow-sm">
          <select 
            value={mes} 
            onChange={(e) => setMes(e.target.value)}
            className="border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i+1} value={i+1}>Mes {i+1}</option>
            ))}
          </select>
          <select 
            value={anio} 
            onChange={(e) => setAnio(e.target.value)}
            className="border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Ventas por Periodo */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-3">
              <ChartBarIcon className="w-5 h-5"/>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Ventas por Periodo</h3>
            <p className="text-sm text-gray-500 mb-4">Total Ingresos</p>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              ${parseFloat(ventas_periodo?.total_ventas || 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-500 flex justify-between">
              <span>Gravado: ${parseFloat(ventas_periodo?.total_gravado || 0).toFixed(2)}</span>
              <span>Exento: ${parseFloat(ventas_periodo?.total_exento || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Reporte de Impuestos */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-3">
              <ArrowDownTrayIcon className="w-5 h-5"/>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Impuestos (IVA)</h3>
            <p className="text-sm text-gray-500 mb-4">Débito Fiscal Acumulado</p>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              ${parseFloat(impuestos?.total_iva_cobrado || 0).toFixed(2)}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => handleDescargar('consumidor')} className="flex-1 bg-blue-50 text-blue-600 text-xs font-bold py-2 rounded-lg hover:bg-blue-100 transition">
              LIBRO CF
            </button>
            <button onClick={() => handleDescargar('contribuyente')} className="flex-1 bg-blue-50 text-blue-600 text-xs font-bold py-2 rounded-lg hover:bg-blue-100 transition">
              LIBRO CONTRIB.
            </button>
          </div>
        </div>

        {/* Documentos Emitidos */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
              <DocumentTextIcon className="w-5 h-5"/>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Documentos Emitidos</h3>
            <p className="text-sm text-gray-500 mb-4">DTEs procesados con éxito</p>
            <div className="text-3xl font-bold text-gray-900 mb-4">
              {documentos_emitidos?.total || 0}
            </div>
            <div className="space-y-1">
              {documentos_emitidos?.por_tipo?.map((t, idx) => (
                <div key={idx} className="flex justify-between text-xs text-gray-600">
                  <span className="truncate pr-2">{t.tipo}</span>
                  <span className="font-semibold bg-gray-100 px-2 py-0.5 rounded">{t.cantidad}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Actividad */}
      <section className="bg-white rounded-2xl border shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-6">Actividad Reciente (Tendencia de Ventas)</h3>
        <div className="h-80 w-full">
          {actividad_reciente && actividad_reciente.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={actividad_reciente} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="fecha" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getDate()}/${d.getMonth()+1}`;
                  }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  formatter={(value) => [`$${parseFloat(value).toFixed(2)}`, 'Ventas']}
                  labelFormatter={(label) => `Fecha: ${label}`}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total_ventas" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorVentas)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No hay actividad en este periodo.
             </div>
          )}
        </div>
      </section>
    </div>
  );
}
