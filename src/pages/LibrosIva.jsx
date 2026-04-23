import { BookOpenIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export default function LibrosIva() {
  const libros = [
    { mes: "Enero", gestion: "2026", compras: 125, ventas: 342, estado: "Cerrado" },
    { mes: "Febrero", gestion: "2026", compras: 110, ventas: 298, estado: "Cerrado" },
    { mes: "Marzo", gestion: "2026", compras: 145, ventas: 412, estado: "Abierto" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Libros de IVA</h1>
          <p className="text-sm text-gray-500">Gestión de libros de compras, ventas y exportaciones.</p>
        </div>
        <button className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition">
           <BookOpenIcon className="w-5 h-5 mr-2"/> GENERAR NUEVO LIBRO
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Ventas Consumidor', 'Contribuyentes', 'Compras', 'Exportaciones'].map((libro) => (
          <div key={libro} className="bg-white p-6 rounded-2xl border shadow-sm text-center space-y-2">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{libro}</p>
            <p className="text-2xl font-bold text-gray-800">Marzo 2026</p>
            <button className="w-full py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition">
              DESCARGAR CSV/PDF
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="font-semibold text-gray-800">Historial de Cierres Mensuales</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-500 uppercase font-semibold">
              <th className="px-6 py-4">Mes / Gestión</th>
              <th className="px-6 py-4">Doc. Compras</th>
              <th className="px-6 py-4">Doc. Ventas</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {libros.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-800">{item.mes} {item.gestion}</td>
                <td className="px-6 py-4 text-gray-600">{item.compras}</td>
                <td className="px-6 py-4 text-gray-600">{item.ventas}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.estado === 'Cerrado' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>
                    {item.estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-700">
                    <ArrowDownTrayIcon className="w-5 h-5"/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
