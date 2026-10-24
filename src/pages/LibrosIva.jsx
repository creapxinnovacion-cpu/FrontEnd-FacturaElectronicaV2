import { useState } from "react";
import { BookOpenIcon, ArrowDownTrayIcon, DocumentTextIcon, TableCellsIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
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

  const getDownloadUrl = (endpoint, formato, mes, anio, tipo = 'libro') => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
    return `${apiBase}/libros-iva/${endpoint}?emisor_id=${emisorId}&mes=${mes}&anio=${anio}&formato=${formato}&tipo=${tipo}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex justify-between items-center bg-white p-4 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Libros de IVA & Anexos F-07</h1>
          <p className="text-sm text-gray-500">Gestión de libros contables y descarga de anexos oficiales para Ministerio de Hacienda.</p>
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

      {/* Sección Principal: Tarjetas de Ventas Separadas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <span>Libros de Ventas y Anexos F-07 (DGII)</span>
            <span className="text-xs font-normal text-gray-500">· Periodo: {getMonthName(selectedMonth)} {selectedYear}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tarjeta de Ventas: Consumidor Final (DTE 01) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700">
                    DTE 01 · Facturas
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">Ventas a Consumidor Final</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-gray-400 block">Periodo</span>
                  <span className="text-sm font-bold text-gray-700">{getMonthName(selectedMonth)} {selectedYear}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Genera el libro mensual para archivo contable o el archivo normativo con consolidación diaria obligatoria para el portal MH.
              </p>
            </div>

            <div className="space-y-4">
              {/* Bloque Libro Contable */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                    <BookOpenIcon className="w-3.5 h-3.5 text-slate-500" />
                    Libro Contable
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Uso interno / Auditoría</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={getDownloadUrl('consumidor', 'pdf', selectedMonth, selectedYear, 'libro')}
                    target="_blank" rel="noreferrer"
                    className="flex items-center justify-center py-2 px-3 bg-white text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-50 hover:border-red-300 transition shadow-xs"
                    title="Descargar Libro de Consumidor Final en PDF"
                  >
                    <DocumentTextIcon className="w-4 h-4 mr-1 text-red-500" /> PDF
                  </a>
                  <a
                    href={getDownloadUrl('consumidor', 'csv', selectedMonth, selectedYear, 'libro')}
                    target="_blank" rel="noreferrer"
                    className="flex items-center justify-center py-2 px-3 bg-white text-gray-700 border border-gray-300 rounded-lg text-xs font-bold hover:bg-gray-100 hover:border-gray-400 transition shadow-xs"
                    title="Descargar CSV con encabezados legibles para Microsoft Excel"
                  >
                    <TableCellsIcon className="w-4 h-4 mr-1 text-emerald-600" /> CSV Libro
                  </a>
                </div>
              </div>

              {/* Bloque Ministerio de Hacienda (F-07) */}
              <div className="bg-emerald-50/70 border-2 border-emerald-300/90 rounded-xl p-3.5 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                    <span>🏛️</span> Ministerio de Hacienda (F-07)
                  </span>
                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-mono font-bold shadow-xs">
                    23 Col · Diario
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-tight">
                  Formato normativo oficial sin encabezados, consolidado por fecha con IVA incluido.
                </p>
                <div className="pt-1">
                  <a
                    href={getDownloadUrl('consumidor', 'csv', selectedMonth, selectedYear, 'anexo_f07')}
                    target="_blank" rel="noreferrer"
                    className="w-full flex items-center justify-center py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold tracking-wide transition shadow-sm hover:shadow gap-1.5"
                    title="Descargar CSV oficial Anexo 2 F-07 (sin encabezados, consolidado por día para DGII)"
                  >
                    <span>🏛️</span> Anexo F-07 (MH)
                    <ArrowDownTrayIcon className="w-4 h-4 ml-0.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Ventas: Contribuyentes (DTE 03, 05, 06) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700">
                    DTE 03, 05, 06 · Crédito Fiscal
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">Ventas a Contribuyentes</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-gray-400 block">Periodo</span>
                  <span className="text-sm font-bold text-gray-700">{getMonthName(selectedMonth)} {selectedYear}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Genera el detalle de CCF, Notas de Crédito y Débito con reglas de exclusión NIT/NRC vs DUI para el Anexo 1 F-07.
              </p>
            </div>

            <div className="space-y-4">
              {/* Bloque Libro Contable */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                    <BookOpenIcon className="w-3.5 h-3.5 text-slate-500" />
                    Libro Contable
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Uso interno / Auditoría</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={getDownloadUrl('contribuyente', 'pdf', selectedMonth, selectedYear, 'libro')}
                    target="_blank" rel="noreferrer"
                    className="flex items-center justify-center py-2 px-3 bg-white text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-50 hover:border-red-300 transition shadow-xs"
                    title="Descargar Libro de Contribuyentes en PDF"
                  >
                    <DocumentTextIcon className="w-4 h-4 mr-1 text-red-500" /> PDF
                  </a>
                  <a
                    href={getDownloadUrl('contribuyente', 'csv', selectedMonth, selectedYear, 'libro')}
                    target="_blank" rel="noreferrer"
                    className="flex items-center justify-center py-2 px-3 bg-white text-gray-700 border border-gray-300 rounded-lg text-xs font-bold hover:bg-gray-100 hover:border-gray-400 transition shadow-xs"
                    title="Descargar CSV con encabezados legibles para Microsoft Excel"
                  >
                    <TableCellsIcon className="w-4 h-4 mr-1 text-emerald-600" /> CSV Libro
                  </a>
                </div>
              </div>

              {/* Bloque Ministerio de Hacienda (F-07) */}
              <div className="bg-emerald-50/70 border-2 border-emerald-300/90 rounded-xl p-3.5 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                    <span>🏛️</span> Ministerio de Hacienda (F-07)
                  </span>
                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-mono font-bold shadow-xs">
                    20 Col · Doc x Doc
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-tight">
                  Formato normativo oficial sin encabezados, 1 fila por documento, sanitizado sin guiones.
                </p>
                <div className="pt-1">
                  <a
                    href={getDownloadUrl('contribuyente', 'csv', selectedMonth, selectedYear, 'anexo_f07')}
                    target="_blank" rel="noreferrer"
                    className="w-full flex items-center justify-center py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold tracking-wide transition shadow-sm hover:shadow gap-1.5"
                    title="Descargar CSV oficial Anexo 1 F-07 (sin encabezados, 20 columnas para DGII)"
                  >
                    <span>🏛️</span> Anexo F-07 (MH)
                    <ArrowDownTrayIcon className="w-4 h-4 ml-0.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Módulos Complementarios: Compras y Exportaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tarjeta: Compras */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700">
              DTE Recibidos · Proveedores
            </span>
            <h4 className="font-bold text-gray-800 text-sm">Libro de Compras (Anexo 3 F-07)</h4>
            <p className="text-xs text-gray-500">Carga y validación de JSONs de compras para generación del Anexo 3 oficial.</p>
          </div>
          <Link
            to="/compras"
            className="shrink-0 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition shadow-sm ml-4"
          >
            Ir a Compras →
          </Link>
        </div>

        {/* Tarjeta: Exportaciones */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between opacity-60">
          <div className="space-y-1">
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
              DTE 11 · Aduanas
            </span>
            <h4 className="font-bold text-gray-500 text-sm">Libro de Exportaciones</h4>
            <p className="text-xs text-gray-400">Facturación a clientes internacionales y exportaciones de servicios.</p>
          </div>
          <span className="shrink-0 px-3 py-1 bg-gray-100 text-gray-400 rounded-lg text-xs font-bold cursor-not-allowed ml-4">
            EN DESARROLLO
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="font-semibold text-gray-800 text-center">Historial de Cierres Mensuales</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-500 uppercase font-semibold">
              <th className="px-6 py-4">Mes / Gestión</th>
              <th className="px-6 py-4">Doc. Compras</th>
              <th className="px-6 py-4">Doc. Ventas</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-center">Libros Contables (PDF)</th>
              <th className="px-6 py-4 text-right">Anexos Oficiales F-07 (MH)</th>
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
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <a
                      href={getDownloadUrl('consumidor', 'pdf', item.mesValue, item.gestion, 'libro')}
                      target="_blank" rel="noreferrer"
                      className="px-2.5 py-1 text-blue-600 bg-blue-50 rounded hover:bg-blue-600 hover:text-white text-xs font-semibold flex items-center transition"
                      title="PDF Consumidor Final"
                    >
                      <DocumentTextIcon className="w-3.5 h-3.5 mr-1" /> Consumidor
                    </a>
                    <a
                      href={getDownloadUrl('contribuyente', 'pdf', item.mesValue, item.gestion, 'libro')}
                      target="_blank" rel="noreferrer"
                      className="px-2.5 py-1 text-red-600 bg-red-50 rounded hover:bg-red-600 hover:text-white text-xs font-semibold flex items-center transition"
                      title="PDF Contribuyente"
                    >
                      <DocumentTextIcon className="w-3.5 h-3.5 mr-1" /> Contribuyente
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <a
                      href={getDownloadUrl('consumidor', 'csv', item.mesValue, item.gestion, 'anexo_f07')}
                      target="_blank" rel="noreferrer"
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded text-xs font-bold flex items-center transition border border-emerald-200"
                      title="Descargar Anexo 2 F-07 (Consumidor Final)"
                    >
                      <ArrowDownTrayIcon className="w-3.5 h-3.5 mr-1" /> Anexo 2 (CF)
                    </a>
                    <a
                      href={getDownloadUrl('contribuyente', 'csv', item.mesValue, item.gestion, 'anexo_f07')}
                      target="_blank" rel="noreferrer"
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded text-xs font-bold flex items-center transition border border-emerald-200"
                      title="Descargar Anexo 1 F-07 (Contribuyentes)"
                    >
                      <ArrowDownTrayIcon className="w-3.5 h-3.5 mr-1" /> Anexo 1 (Contrib.)
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

