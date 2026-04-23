import { XCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function Anulaciones() {
  const anulados = [
    { id: 1, dte: "01-FC-0001", fecha: "2026-03-20", monto: 120.00, motivo: "Error en datos del receptor" },
    { id: 2, dte: "03-CCF-0452", fecha: "2026-03-22", monto: 450.50, motivo: "Devolución total de mercadería" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex justify-between items-center bg-red-50 p-6 rounded-2xl border border-red-100">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="w-10 h-10 text-red-600 mr-4"/>
          <div>
            <h1 className="text-xl font-bold text-red-900">Módulo de Anulaciones / Invalidaciones</h1>
            <p className="text-sm text-red-700">Recuerda que tienes un plazo legal para anular documentos emitidos.</p>
          </div>
        </div>
        <button className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition">
          ANULAR DOCUMENTO
        </button>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Documentos Anulados Recientemente</h3>
          <span className="text-xs text-gray-400">Mostrando últimos 30 días</span>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-500 uppercase font-semibold">
              <th className="px-6 py-4">Documento (DTE)</th>
              <th className="px-6 py-4">Fecha Anulación</th>
              <th className="px-6 py-4">Monto Original</th>
              <th className="px-6 py-4">Motivo</th>
              <th className="px-6 py-4 text-right">Estado MH</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {anulados.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-bold text-gray-800">{item.dte}</td>
                <td className="px-6 py-4 text-gray-600">{item.fecha}</td>
                <td className="px-6 py-4 text-gray-600 font-medium">$ {item.monto.toFixed(2)}</td>
                <td className="px-6 py-4 text-gray-500 italic">"{item.motivo}"</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end text-green-600 font-bold text-[10px]">
                    <XCircleIcon className="w-4 h-4 mr-1"/> PROCESADO POR MH
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
