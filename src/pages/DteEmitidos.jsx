import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DocumentTextIcon, EyeIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { dteService } from "@/services/api/dte.service";

export default function DteEmitidos() {
  const [dtes, setDtes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDtes = async () => {
      try {
        const data = await dteService.getAll();
        setDtes(data);
      } catch (error) {
        console.error("Error al obtener DTEs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDtes();
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Cargando DTEs emitidos...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">DTEs Emitidos</h1>
        <p className="text-sm text-gray-500">Historial de documentos enviados al Ministerio de Hacienda</p>
      </header>

      <div className="bg-white border rounded-2xl shadow-sm overflow-x-auto">
        <table className="min-w-[1400px] w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receptor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado MH</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sello Recepción</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dtes.map((dte) => (
              <tr key={dte.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                  {dte.fecha_emision?.split('T')[0].split('-').reverse().join('/')} {dte.hora_emision}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                  {dte.receptor_nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                  ${parseFloat(dte.total_pagar).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${dte.estado_actual === 'ACEPTADO' ? 'bg-green-100 text-green-700' :
                    dte.estado_actual === 'RECHAZADO' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {dte.estado_actual}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                  {dte.sello_recepcion || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href={`http://localhost:8000/api/dtes/${dte.id}/pdf`} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-900 inline-flex items-center">
                    <DocumentTextIcon className="w-5 h-5 mr-1" /> PDF
                  </a>
                  <a href={`http://localhost:8000/api/dtes/${dte.id}/json`} target="_blank" rel="noreferrer" className="text-green-600 hover:text-green-900 inline-flex items-center ml-3">
                    <DocumentTextIcon className="w-5 h-5 mr-1" /> JSON
                  </a>
                  {['01', '1', '11', '14'].includes(String(dte.tipo_dte)) && dte.estado_actual === 'ACEPTADO' && (
                    <Link
                      to="/retornos"
                      className="text-emerald-600 hover:text-emerald-800 font-semibold inline-flex items-center ml-3"
                      title="Emitir Evento de Retorno de mercadería"
                    >
                      <ArrowUturnLeftIcon className="w-4 h-4 mr-1" /> Retorno
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {dtes.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                  No hay DTEs emitidos aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
