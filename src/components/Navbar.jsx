import { useState } from "react";
import { Link } from "react-router-dom";
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dteDropdown, setDteDropdown] = useState(false);

  const dteSubmenu = [
    { name: "Factura Consumidor Final", path: "/factura-consumidor" },
    { name: "Comprobante de Crédito Fiscal", path: "/credito-fiscal" },
    { name: "Nota de Crédito", path: "/nota-credito" },
    { name: "Nota de Débito", path: "/nota-debito" },
    { name: "Factura de Sujeto Excluido", path: "/sujeto-excluido" },
  ];

  const menu = [
    { name: "Reportes", path: "/reportes" },
    { name: "Stock", path: "/stock" },
    { name: "Libros IVA", path: "/libros-iva" },
    { name: "Anulaciones", path: "/anulaciones" },
    { name: "Estados de emisión", path: "/estados-emision" },
    { name: "configuracion de Sistema", path: "/emisorConfig" },
  ];

  return (
    <nav className="bg-[#1A2B3C] border-b border-white/10 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <Link to="/" className="text-xl font-black text-white tracking-tighter">
            FACT<span className="text-blue-500">PRO</span>
          </Link>

          {/* MENU DESKTOP */}
          <div className="hidden md:flex items-center space-x-4">
            {/* DROPDOWN DTE */}
            <div className="relative">
              <button
                onMouseEnter={() => setDteDropdown(true)}
                onMouseLeave={() => setDteDropdown(false)}
                className="text-white hover:text-blue-400 font-bold text-sm transition flex items-center gap-1 py-5"
              >
                SISTEMA DE FACTURACION ELECTRONICA
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${dteDropdown ? 'rotate-180' : ''}`} />
              </button>

              {dteDropdown && (
                <div 
                  onMouseEnter={() => setDteDropdown(true)}
                  onMouseLeave={() => setDteDropdown(false)}
                  className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-2xl py-3 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  {dteSubmenu.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className="block px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* OTROS LINKS */}
            {menu.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-white/70 hover:text-white text-xs font-bold uppercase tracking-widest transition"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* BOTÓN MOBILE */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-white hover:text-blue-400"
            aria-label="Abrir menú"
          >
            {open ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* MENU MOBILE */}
      {open && (
        <div className="md:hidden bg-[#1A2B3C] border-t border-white/10">
          <div className="flex flex-col px-4 py-6 space-y-4">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Facturación Electrónica</p>
            {dteSubmenu.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setOpen(false)}
                className="py-2 px-4 rounded-xl text-white font-medium hover:bg-blue-500 transition"
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t border-white/5 pt-4">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2 mb-2">Administración</p>
              {menu.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className="block py-2 px-4 rounded-xl text-white/70 font-medium hover:bg-white/5 hover:text-white transition"
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
