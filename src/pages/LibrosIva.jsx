import { useState } from "react";
import { BookOpenIcon, ArrowDownTrayIcon, DocumentTextIcon, TableCellsIcon } from "@heroicons/react/24/outline";

export default function LibrosIva() {
  const [emisorId, _setEmisorId] = useState(1);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  const meses = [
    { value: "1", label: "Enero" }, { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" }, { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" }, { value: "6", label: "Junio" },
    { value: "7", label: "Julio" }, { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" }, { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" }, { value: "12", label: "Diciembre" }
  ];

  const anios = ["2026", "2025", "2024"];

  const getMonthName = (monthValue) => meses.find(m => m.value === monthValue?.toString())?.label || '';

  // Simulación de historial desde la BD
  const libros = [
    { mesValue: "1", mes: "Enero", gestion: "2026", compras: 125, ventas: 342, estado: "Cerrado" },
    { mesValue: "2", mes: "Febrero", gestion: "2026", compras: 110, ventas: 298, estado: "Cerrado" },
    { mesValue: "3", mes: "Marzo", gestion: "2026", compras: 145, ventas: 412, estado: "Abierto" },
  ];

  const getDownloadUrl = (endpoint, formato, mes, anio) => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
    return `${apiBase}/libros-iva/${endpoint}?emisor_id=${emisorId}&mes=${mes}&anio=${anio}&formato=${formato}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex justify-between items-center bg-white p-4 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Libros de IVA</h1>
          <p className="text-sm text-gray-500">Gestión y descarga de libros de ventas y compras.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-gray-50 rounded-lg p-1 border">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer"
            >
              {meses.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <span className="text-gray-300 py-1">|</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer"
            >
              {anios.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tarjeta: Ventas Consumidor */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm text-center space-y-3 flex flex-col justify-between transition hover:shadow-md">
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Ventas Consumidor</p>
            <p className="text-xl font-bold text-gray-800">{getMonthName(selectedMonth)} {selectedYear}</p>
          </div>
          <div className="flex gap-2">
            <a
              href={getDownloadUrl('consumidor', 'pdf', selectedMonth, selectedYear)}
              target="_blank" rel="noreferrer"
              className="flex flex-1 items-center justify-center py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition"
              title="Descargar PDF"
            >
              <DocumentTextIcon className="w-4 h-4 mr-1" /> PDF
            </a>
            <a
              href={getDownloadUrl('consumidor', 'csv', selectedMonth, selectedYear)}
              target="_blank" rel="noreferrer"
              className="flex flex-1 items-center justify-center py-2 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 transition"
              title="Descargar CSV"
            >
              <TableCellsIcon className="w-4 h-4 mr-1" /> CSV
            </a>
          </div>
        </div>

        {/* Tarjeta: Contribuyentes */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm text-center space-y-3 flex flex-col justify-between transition hover:shadow-md">
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Contribuyentes</p>
            <p className="text-xl font-bold text-gray-800">{getMonthName(selectedMonth)} {selectedYear}</p>
          </div>
          <div className="flex gap-2">
            <a
              href={getDownloadUrl('contribuyente', 'pdf', selectedMonth, selectedYear)}
              target="_blank" rel="noreferrer"
              className="flex flex-1 items-center justify-center py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition"
            >
              <DocumentTextIcon className="w-4 h-4 mr-1" /> PDF
            </a>
            <a
              href={getDownloadUrl('contribuyente', 'csv', selectedMonth, selectedYear)}
              target="_blank" rel="noreferrer"
              className="flex flex-1 items-center justify-center py-2 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 transition"
            >
              <TableCellsIcon className="w-4 h-4 mr-1" /> CSV
            </a>
          </div>
        </div>

        {/* Tarjeta: Compras (Pendiente de Backend) */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm text-center space-y-3 flex flex-col justify-between opacity-60">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Compras</p>
            <p className="text-xl font-bold text-gray-400">{getMonthName(selectedMonth)} {selectedYear}</p>
          </div>
          <button disabled className="w-full py-2 bg-gray-100 text-gray-400 rounded-lg text-xs font-bold cursor-not-allowed">
            EN DESARROLLO
          </button>
        </div>

        {/* Tarjeta: Exportaciones (Pendiente de Backend) */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm text-center space-y-3 flex flex-col justify-between opacity-60">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Exportaciones</p>
            <p className="text-xl font-bold text-gray-400">{getMonthName(selectedMonth)} {selectedYear}</p>
          </div>
          <button disabled className="w-full py-2 bg-gray-100 text-gray-400 rounded-lg text-xs font-bold cursor-not-allowed">
            EN DESARROLLO
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden ">
        <div className="p-6 border-b">
          <h3 className="font-semibold text-gray-800 text-center">Historial de Cierres Mensuales</h3>
        </div>
        <table className="w-full text-left ">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-500 uppercase font-semibold">
              <th className="px-6 py-4">Mes / Gestión</th>
              <th className="px-6 py-4">Doc. Compras</th>
              <th className="px-6 py-4">Doc. Ventas</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right ">Descargas Rápidas (PDF)</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {libros.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition group">
                <td className="px-6 py-4 font-medium text-gray-800">{item.mes} {item.gestion}</td>
                <td className="px-6 py-4 text-gray-600">{item.compras}</td>
                <td className="px-6 py-4 text-gray-600">{item.ventas}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.estado === 'Cerrado' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>
                    {item.estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-right ">
                  <div className="flex justify-end gap-2  ">
                    <a
                      href={getDownloadUrl('consumidor', 'pdf', item.mesValue, item.gestion)}
                      target="_blank" rel="noreferrer"
                      className="px-3 py-1  text-blue-600 rounded hover:bg-blue-600 hover:text-white text-xs font-semibold flex items-center"
                    >
                      <ArrowDownTrayIcon className="w-3 h-3 mr-1" /> Consumidor
                    </a>
                    <a
                      href={getDownloadUrl('contribuyente', 'pdf', item.mesValue, item.gestion)}
                      target="_blank" rel="noreferrer"
                      className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-600 hover:text-white text-xs font-semibold flex items-center"
                    >
                      <ArrowDownTrayIcon className="w-3 h-3 mr-1" /> Contribuyente
                    </a>
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
