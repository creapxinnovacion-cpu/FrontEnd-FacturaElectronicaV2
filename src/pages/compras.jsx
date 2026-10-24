import { useState, useEffect, useRef } from "react";
import {
  BookOpenIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TableCellsIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  InformationCircleIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon
} from "@heroicons/react/24/outline";

export default function Compras() {
  const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Estados de Configuración y Período
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [emisor, setEmisor] = useState({
    nombre: "MI EMPRESA, S.A. DE C.V.",
    nit: "0614-010190-101-1",
    nrc: "123456-7"
  });

  // Estados de Procesamiento
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [registros, setRegistros] = useState([]);
  const [totales, setTotales] = useState({
    total_documentos: 0,
    validos: 0,
    observados: 0,
    rechazados: 0,
    total_exentas: 0,
    total_gravadas: 0,
    total_iva: 0,
    total_percepcion: 0,
    total_compras: 0
  });

  // Filtros y Vista
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [saldoContable, setSaldoContable] = useState("");
  const fileInputRef = useRef(null);

  const meses = [
    { value: "1", label: "Enero" }, { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" }, { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" }, { value: "6", label: "Junio" },
    { value: "7", label: "Julio" }, { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" }, { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" }, { value: "12", label: "Diciembre" }
  ];

  const anios = ["2026", "2025", "2024"];

  // Cargar configuración de Emisor al iniciar
  useEffect(() => {
    fetch(`${apiBase}/compras/configuracion?emisor_id=1`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.emisor) {
          setEmisor(data.emisor);
        }
      })
      .catch(() => {
        // Fallback silencioso
      });
  }, [apiBase]);

  // Manejo de carga de archivos (Selector y Drag & Drop)
  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("mes", selectedMonth);
      formData.append("anio", selectedYear);
      formData.append("receptor_nit", emisor.nit || "");
      formData.append("emisor_id", emisor.id || 1);

      Array.from(files).forEach((file) => {
        if (file.name.endsWith('.json')) {
          formData.append("archivos[]", file);
        }
      });

      const response = await fetch(`${apiBase}/compras/procesar`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setRegistros(data.registros || []);
        setTotales(data.totales || {});
      } else {
        alert(data.message || "Error al procesar los archivos JSON");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al procesar los JSON de compras.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Drag & Drop Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Exportar CSV (Anexo F07 o Libro)
  const handleExportCsv = async (tipo = 'anexo_f07') => {
    if (registros.length === 0) {
      alert("No hay registros para exportar.");
      return;
    }

    try {
      const response = await fetch(`${apiBase}/compras/exportar-csv`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registros,
          mes: selectedMonth,
          anio: selectedYear,
          tipo
        }),
      });

      if (!response.ok) throw new Error("Error al generar CSV");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = tipo === 'anexo_f07'
        ? `Anexo_Compras_F07_${selectedMonth}_${selectedYear}.csv`
        : `Libro_Compras_${selectedMonth}_${selectedYear}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert("No se pudo generar el archivo CSV.");
    }
  };

  // Exportar o Ver PDF
  const handleExportPdf = async (accion = 'descargar') => {
    if (registros.length === 0) {
      alert("No hay registros para generar el PDF.");
      return;
    }

    try {
      const response = await fetch(`${apiBase}/compras/exportar-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registros,
          mes: selectedMonth,
          anio: selectedYear,
          emisor_id: emisor.id || 1,
          accion
        }),
      });

      if (!response.ok) throw new Error("Error al procesar PDF");

      const blob = await response.blob();
      const fileUrl = window.URL.createObjectURL(blob);

      if (accion === 'ver') {
        window.open(fileUrl, '_blank');
      } else {
        const a = document.createElement("a");
        a.href = fileUrl;
        a.download = `Libro_Compras_${selectedMonth}_${selectedYear}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo generar el documento PDF.");
    }
  };

  // Filtrado de registros en tabla
  const registrosFiltrados = registros.filter((r) => {
    const cumpleEstado =
      filtroEstado === "todos" ||
      r.estado === filtroEstado;

    const term = busqueda.toLowerCase();
    const cumpleBusqueda =
      !term ||
      r.proveedor?.nombre?.toLowerCase().includes(term) ||
      r.proveedor?.nit?.toLowerCase().includes(term) ||
      r.proveedor?.nrc?.toLowerCase().includes(term) ||
      r.codigo_generacion?.toLowerCase().includes(term) ||
      r.numero_control?.toLowerCase().includes(term);

    return cumpleEstado && cumpleBusqueda;
  });

  // Cálculo de conciliación
  const diffConciliacion = saldoContable !== ""
    ? (parseFloat(saldoContable) - totales.total_iva).toFixed(2)
    : null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. ENCABEZADO Y PERÍODO */}
      <header className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <BookOpenIcon className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Libro de Compras</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">F07 IVA</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Validación de DTE 03 (CCF) recibidos, generación de Libro Oficial (13 col.) y Anexo de Compras CSV (21 col.).
          </p>
        </div>

        {/* SELECTORES DE PERÍODO Y DATOS CONTRIBUYENTE */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              {meses.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              {anios.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-600">
            <BuildingOfficeIcon className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">{emisor.nombre}</span>
            <span className="text-slate-400">|</span>
            <span>NIT: {emisor.nit}</span>
          </div>
        </div>
      </header>

      {/* 2. ZONA DE CARGA DE ARCHIVOS JSON (DRAG & DROP) */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          dragActive
            ? "border-blue-500 bg-blue-50/50 scale-[1.01]"
            : "border-slate-300 hover:border-blue-400 bg-white"
        }`}
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            {loading ? (
              <ArrowPathIcon className="w-7 h-7 animate-spin" />
            ) : (
              <CloudArrowUpIcon className="w-7 h-7" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Arrastra y suelta aquí los JSON de Crédito Fiscal (DTE 03)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Puedes cargar múltiples archivos simultáneamente. Se validarán reglas aritméticas, IVA 13%, período y duplicados.
            </p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".json"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <button
              disabled={loading}
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <DocumentTextIcon className="w-4 h-4" />
              Seleccionar Archivos JSON
            </button>
          </div>
        </div>
      </div>

      {/* 3. RESUMEN DE TOTALES Y ESTADOS */}
      {registros.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Documentos</p>
            <p className="text-xl font-black text-slate-800 mt-1">{totales.total_documentos}</p>
            <div className="flex gap-2 text-[10px] mt-2 font-semibold">
              <span className="text-emerald-600">{totales.validos} Válidos</span>
              <span className="text-amber-500">{totales.observados} Obs.</span>
              <span className="text-rose-500">{totales.rechazados} Rech.</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Compras Exentas</p>
            <p className="text-xl font-black text-slate-800 mt-1">
              ${totales.total_exentas?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-400 mt-2">Internas e Importaciones</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Compras Gravadas</p>
            <p className="text-xl font-black text-blue-600 mt-1">
              ${totales.total_gravadas?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-400 mt-2">Base Sujeta a IVA</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Crédito Fiscal (IVA)</p>
            <p className="text-xl font-black text-emerald-600 mt-1">
              ${totales.total_iva?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-400 mt-2">13% Deducción F07</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Compras</p>
            <p className="text-xl font-black text-slate-900 mt-1">
              ${totales.total_compras?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-400 mt-2">Total Operación</p>
          </div>
        </div>
      )}

      {/* 4. BARRA DE ACCIONES DE EXPORTACIÓN Y CONCILIACIÓN */}
      {registros.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-4">
          {/* CONCILIACIÓN RÁPIDA */}
          <div className="flex items-center gap-2 text-xs w-full lg:w-auto">
            <span className="font-semibold text-slate-600">Saldo Contable IVA:</span>
            <input
              type="number"
              step="0.01"
              placeholder="$0.00"
              value={saldoContable}
              onChange={(e) => setSaldoContable(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg w-28 text-xs font-mono text-slate-800 outline-none focus:border-blue-500"
            />
            {diffConciliacion !== null && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                Math.abs(diffConciliacion) < 0.02
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-800"
              }`}>
                Dif: ${diffConciliacion}
              </span>
            )}
          </div>

          {/* BOTONES DE DESCARGA */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            <button
              onClick={() => handleExportPdf('ver')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <EyeIcon className="w-4 h-4 text-slate-500" />
              Ver PDF
            </button>
            <button
              onClick={() => handleExportPdf('descargar')}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <DocumentTextIcon className="w-4 h-4 text-rose-600" />
              Descargar PDF (13 Col.)
            </button>
            <button
              onClick={() => handleExportCsv('anexo_f07')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <TableCellsIcon className="w-4 h-4" />
              Descargar CSV Anexo F07 (21 Col.)
            </button>
            <button
              onClick={() => handleExportCsv('libro_13')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              CSV Libro
            </button>
          </div>
        </div>
      )}

      {/* 5. TABLA DE REGISTROS DE COMPRAS */}
      {registros.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          {/* BARRA DE FILTROS */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-400 uppercase">Filtrar:</span>
              <div className="flex gap-1">
                {["todos", "valido", "observado", "rechazado"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFiltroEstado(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                      filtroEstado === st
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full md:w-72">
              <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por proveedor, NRC, NIT..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* TABLA PRINCIPAL */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-center">No.</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Doc / Código Gen.</th>
                  <th className="px-4 py-3">Proveedor</th>
                  <th className="px-4 py-3 text-right">Exentas</th>
                  <th className="px-4 py-3 text-right">Gravadas</th>
                  <th className="px-4 py-3 text-right">IVA (13%)</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registrosFiltrados.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3 text-center font-bold text-slate-500">
                      {r.correlativo || (idx + 1)}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">
                      {r.fecha_formateada || r.fecha_emision}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-[11px] text-slate-700 truncate max-w-[140px]" title={r.codigo_generacion}>
                        {r.codigo_generacion}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">{r.numero_control}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800 truncate max-w-[200px]" title={r.proveedor?.nombre}>
                        {r.proveedor?.nombre}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        NRC: {r.proveedor?.nrc} | NIT: {r.proveedor?.nit}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600">
                      ${r.col_6_exentas?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800">
                      ${r.col_8_gravadas?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">
                      ${r.col_10_iva?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      ${r.col_12_total?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        r.estado === 'valido'
                          ? 'bg-emerald-100 text-emerald-700'
                          : r.estado === 'observado'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {r.estado === 'valido' && <CheckCircleIcon className="w-3 h-3" />}
                        {r.estado === 'observado' && <ExclamationTriangleIcon className="w-3 h-3" />}
                        {r.estado === 'rechazado' && <XCircleIcon className="w-3 h-3" />}
                        {r.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedDoc(r)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. MODAL DETALLE DE HALLAZGOS Y DOCUMENTO */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Detalle del Comprobante</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedDoc.codigo_generacion}</p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* RESUMEN DEL PROVEEDOR */}
            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
              <p><strong>Proveedor:</strong> {selectedDoc.proveedor?.nombre}</p>
              <p><strong>NRC / NIT:</strong> {selectedDoc.proveedor?.nrc} / {selectedDoc.proveedor?.nit}</p>
              <p><strong>Fecha de Emisión:</strong> {selectedDoc.fecha_formateada || selectedDoc.fecha_emision}</p>
              <p><strong>Archivo Origen:</strong> {selectedDoc.filename}</p>
            </div>

            {/* SECCIÓN DE HALLAZGOS (ALERTAS / ERRORES) */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Hallazgos y Reglas de Validación ({selectedDoc.hallazgos?.length || 0})
              </h4>
              {selectedDoc.hallazgos?.length > 0 ? (
                <div className="space-y-2">
                  {selectedDoc.hallazgos.map((h, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        h.severidad === 'error'
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>[{h.codigo}] {h.severidad.toUpperCase()}</span>
                        {h.ruta && <span className="font-mono text-[10px] opacity-75">{h.ruta}</span>}
                      </div>
                      <p><strong>Causa:</strong> {h.causa}</p>
                      <p className="text-[11px] opacity-90"><strong>Acción sugerida:</strong> {h.accion}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  El documento cumple satisfactoriamente todas las reglas aritméticas y fiscales de Hacienda.
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}