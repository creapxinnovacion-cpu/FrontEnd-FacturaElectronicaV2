import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dteDropdown, setDteDropdown] = useState(false);
  const location = useLocation();

  const dteSubmenu = [
    { name: "Factura Consumidor Final", path: "/factura-consumidor", code: "DTE 01" },
    { name: "Comprobante de Crédito Fiscal", path: "/credito-fiscal", code: "DTE 03" },
    { name: "Nota de Crédito", path: "/nota-credito", code: "DTE 05" },
    { name: "Nota de Débito", path: "/nota-debito", code: "DTE 06" },
    { name: "Factura de Exportación", path: "/exportacion", code: "DTE 11" },
    { name: "Factura de Sujeto Excluido", path: "/sujeto-excluido", code: "DTE 14" },
    { name: "Eventos de Retorno", path: "/retornos", code: "DTE 18" },
  ];

  const menu = [
    { name: "Reportes", path: "/reportes" },
    { name: "Stock", path: "/stock" },
    { name: "Libros IVA", path: "/libros-iva" },
    { name: "Anulaciones", path: "/anulaciones" },
    { name: "Estados de Emisión", path: "/estados-emision" },
    { name: "DTE Emitidos", path: "/dte-emitidos" },
    { name: "Configuración", path: "/emisorConfig" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-[#0F172A] border-b border-slate-800/80 shadow-md sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LOGO & BRAND */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-xl font-black text-white tracking-tight">
                FACT<span className="text-blue-500 group-hover:text-blue-400 transition-colors">PRO</span>
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/50">
              SVFE v2.0
            </span>
          </div>

          {/* MENU DESKTOP */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* DROPDOWN DTEs */}
            <div className="relative">
              <button
                onMouseEnter={() => setDteDropdown(true)}
                onMouseLeave={() => setDteDropdown(false)}
                className="text-slate-200 hover:text-white px-3 py-2 rounded-lg font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Emitir DTE</span>
                <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${dteDropdown ? "rotate-180 text-blue-400" : "text-slate-400"}`} />
              </button>

              {dteDropdown && (
                <div 
                  onMouseEnter={() => setDteDropdown(true)}
                  onMouseLeave={() => setDteDropdown(false)}
                  className="absolute top-full left-0 w-72 bg-white rounded-xl shadow-xl py-2 border border-slate-200/90 animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  <div className="px-4 py-1.5 mb-1 border-b border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Documentos Oficiales MH</span>
                  </div>
                  {dteSubmenu.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center justify-between px-4 py-2 text-xs font-medium transition ${
                        isActive(item.path)
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                      }`}
                    >
                      <span>{item.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">
                        {item.code}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* LINKS PRINCIPALES */}
            {menu.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isActive(item.path)
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* BOTÓN MOBILE */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            aria-label="Abrir menú"
          >
            {open ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MENU MOBILE */}
      {open && (
        <div className="lg:hidden bg-[#0F172A] border-t border-slate-800 px-4 py-5 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2">Documentos Tributarios</p>
          <div className="space-y-1">
            {dteSubmenu.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between py-2 px-3 rounded-lg text-xs font-medium transition ${
                  isActive(item.path) ? "bg-blue-600 text-white" : "text-slate-200 hover:bg-slate-800"
                }`}
              >
                <span>{item.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {item.code}
                </span>
              </Link>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">Módulos Administrativos</p>
            <div className="space-y-1">
              {menu.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`block py-2 px-3 rounded-lg text-xs font-medium transition ${
                    isActive(item.path) ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
