import { useState, useEffect } from "react";
import { 
  PlusIcon, 
  TrashIcon, 
  DocumentTextIcon, 
  UserIcon, 
  MapPinIcon, 
  CreditCardIcon, 
  InformationCircleIcon,
  ShoppingCartIcon
} from "@heroicons/react/24/outline";

export default function Venta() {
  // --- STATE ---
  const [items, setItems] = useState([
    { id: 1, unidadMedida: "Unidad", descripcion: "Producto Ejemplo", cantidad: 1, precio: 0.00, total: 0.00 }
  ]);

  const [emisor, setEmisor] = useState({
    nit: "056347175",
    nrc: "3400370",
    nombre: "CRISTIAN ALEJANDRO CAJUL BLANCO",
    actividad: "96092 - Servicios n.c.p.",
    direccion: "IZALCO, CTON. HUISCOYOLATE CRIO. EL CEGA",
    correo: "chrishalej997@gmail.com",
    telefono: "7448-4708",
    tipoDte: "Factura",
    fecha: new Date().toLocaleDateString('es-SV'),
    hora: new Date().toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  });

  const [receptor, setReceptor] = useState({
    tipoDoc: "",
    numDoc: "",
    nombre: "",
    departamento: "",
    municipio: "",
    complemento: "",
    correo: "",
    telefono: ""
  });

  const [pago, setPago] = useState({
    condicion: "Contado",
    metodo: "Billetes y monedas",
    pagos: []
  });

  const [responsables, setResponsables] = useState({
    emisorNombre: "CRISTIAN ALEJANDRO CAJUL BLANCO",
    emisorDoc: "056347175",
    receptorNombre: "",
    receptorDoc: ""
  });

  const [observaciones, setObservaciones] = useState("");

  // --- LOGIC ---
  const agregarItem = () => {
    setItems([...items, { id: Date.now(), unidadMedida: "Unidad", descripcion: "", cantidad: 1, precio: 0, total: 0 }]);
  };

  const eliminarItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'cantidad' || field === 'precio') {
          updated.total = updated.cantidad * updated.precio;
        }
        return updated;
      }
      return item;
    }));
  };

  const subTotal = items.reduce((acc, item) => acc + item.total, 0);
  const retencionIva = 0; 
  const totalPagar = subTotal - retencionIva;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* HEADER SECTION */}
      <div className="bg-[#1A2B3C] text-white pt-8 pb-16 px-6 mb-[-4rem]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <DocumentTextIcon className="w-8 h-8 text-blue-400" />
              Nueva Factura Electrónica
            </h1>
            <p className="text-blue-200 mt-1 opacity-80">Generación de DTE para el área de ventas</p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-medium transition-all backdrop-blur-sm">
              Guardar Borrador
            </button>
            <button className="px-8 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.02]">
              EMITIR DOCUMENTO
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA (CONTENIDO PRINCIPAL) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* SECCIÓN EMISOR (DETALLES COMPLETOS) */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-blue-50/30 px-8 py-3 border-b border-gray-100 flex justify-between items-center">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">Datos del Emisor</p>
              <span className="text-[10px] font-medium text-blue-400">Configurado vía Certificado</span>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-sm font-black text-gray-900 tracking-tight">{emisor.nombre}</p>
                  <p className="text-xs text-gray-500 font-medium">NIT: {emisor.nit} | NRC: {emisor.nrc}</p>
                  <div className="pt-2 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-600 rounded">ACTIVIDAD</span>
                    <p className="text-xs text-gray-700">{emisor.actividad}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-l border-gray-100 pl-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Tipo de Documento</p>
                    <select 
                      className="w-full bg-blue-50 border border-blue-100 rounded-xl px-3 py-1.5 text-xs font-bold text-blue-600 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                      value={emisor.tipoDte}
                      onChange={(e) => setEmisor({...emisor, tipoDte: e.target.value})}
                    >
                      <option value="Factura Consumidor Final">Factura Consumidor Final</option>
                      <option value="Comprobante de Crédito Fiscal">Comprobante de Crédito Fiscal</option>
                      <option value="Nota de Crédito">Nota de Crédito</option>
                      <option value="Nota de Débito">Nota de Débito</option>
                      <option value="Factura de Sujeto Excluido">Factura de Sujeto Excluido</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Emisión</p>
                    <p className="text-sm text-gray-700 font-medium">{emisor.fecha}</p>
                    <p className="text-[10px] text-gray-400">{emisor.hora}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Establecimiento / Dirección</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{emisor.direccion}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <InformationCircleIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Contacto</p>
                    <p className="text-xs text-gray-600">{emisor.correo}</p>
                    <p className="text-xs text-gray-600">{emisor.telefono}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN RECEPTOR */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50/50 px-8 py-4 border-b border-gray-100 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-gray-400" />
              <h3 className="font-bold text-gray-700">Información del Receptor</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Tipo de Documento (Opcional)</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={receptor.tipoDoc}
                    onChange={(e) => setReceptor({...receptor, tipoDoc: e.target.value})}
                  >
                    <option value="">-- Seleccione --</option>
                    <option value="NIT">NIT</option>
                    <option value="DUI">DUI</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Nombre / Razón Social</label>
                  <input 
                    type="text" 
                    placeholder="Nombre completo del receptor" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={receptor.nombre}
                    onChange={(e) => setReceptor({...receptor, nombre: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Departamento</label>
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Municipio</label>
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Número de Documento</label>
                  <input 
                    type="text" 
                    placeholder="0000-000000-000-0"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={receptor.numDoc}
                    onChange={(e) => setReceptor({...receptor, numDoc: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Correo Electrónico</label>
                  <input type="email" placeholder="ejemplo@correo.com" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Complemento Dirección</label>
                  <textarea 
                    placeholder="Digite el complemento de la dirección" 
                    rows="2"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN PRODUCTOS */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50/50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingCartIcon className="w-5 h-5 text-gray-400" />
                <h3 className="font-bold text-gray-700">Detalle de la Operación</h3>
              </div>
              <button 
                onClick={agregarItem}
                className="inline-flex items-center px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-1" /> AGREGAR ITEM
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-gray-400 uppercase tracking-[0.15em] border-b border-gray-50">
                    <th className="py-4 px-8 font-bold">Unidad</th>
                    <th className="py-4 px-4 font-bold">Descripción</th>
                    <th className="py-4 px-4 font-bold w-24">Cant.</th>
                    <th className="py-4 px-4 font-bold w-32">Precio</th>
                    <th className="py-4 px-4 font-bold w-32">Subtotal</th>
                    <th className="py-4 px-8 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((item) => (
                    <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-8">
                        <select className="bg-transparent border-none text-sm text-gray-600 focus:ring-0 outline-none">
                          <option>Unidad</option>
                          <option>Servicio</option>
                          <option>Peso</option>
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <input 
                          type="text" 
                          placeholder="Descripción del producto..." 
                          className="w-full bg-transparent border-none text-sm text-gray-800 placeholder-gray-300 focus:ring-0 outline-none"
                          value={item.descripcion}
                          onChange={(e) => updateItem(item.id, 'descripcion', e.target.value)}
                        />
                      </td>
                      <td className="py-4 px-4">
                        <input 
                          type="number" 
                          className="w-16 bg-gray-100/50 border-none rounded-lg px-2 py-1 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500/20"
                          value={item.cantidad}
                          onChange={(e) => updateItem(item.id, 'cantidad', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400 text-xs">$</span>
                          <input 
                            type="number" 
                            className="w-24 bg-transparent border-none p-0 text-sm font-medium text-gray-700 focus:ring-0"
                            value={item.precio}
                            onChange={(e) => updateItem(item.id, 'precio', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm font-bold text-gray-900">$ {item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="py-4 px-8 text-right">
                        <button 
                          onClick={() => eliminarItem(item.id)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECCIÓN CONDICIONES Y RESPONSABLES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <CreditCardIcon className="w-5 h-5 text-gray-400" />
                <h3 className="font-bold text-gray-700">Condición y Pago</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500">Condición</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none">
                    <option>Contado</option>
                    <option>Crédito</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500">Forma de Pago</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none">
                    <option>Billetes y monedas</option>
                    <option>Tarjeta de Crédito</option>
                    <option>Transferencia</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-gray-500">Observaciones</label>
                <textarea 
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none resize-none"
                  rows="3"
                  placeholder="Notas adicionales sobre este DTE..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                ></textarea>
              </div>
            </section>

            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <InformationCircleIcon className="w-5 h-5 text-gray-400" />
                <h3 className="font-bold text-gray-700">Responsables</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Emite el documento</p>
                  <p className="text-sm font-bold text-gray-800">{responsables.emisorNombre}</p>
                  <p className="text-xs text-gray-500">Doc: {responsables.emisorDoc}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Recibe el documento</p>
                  <input 
                    type="text" 
                    placeholder="Nombre de quien recibe" 
                    className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-sm outline-none focus:border-blue-500"
                    onChange={(e) => setResponsables({...responsables, receptorNombre: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder="Número de documento" 
                    className="w-full border border-gray-200 rounded-2xl px-4 py-2 text-sm outline-none focus:border-blue-500"
                    onChange={(e) => setResponsables({...responsables, receptorDoc: e.target.value})}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* COLUMNA DERECHA (RESUMEN FINANCIERO) */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            <section className="bg-[#1A2B3C] text-white rounded-[2.5rem] shadow-2xl p-10 overflow-hidden relative">
              {/* Decoración de fondo */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                Resumen de Venta
              </h3>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm font-medium">Subtotal Operación</span>
                  <span className="text-lg font-semibold">$ {subTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-red-400">
                  <span className="text-sm font-medium">Retención IVA (1%)</span>
                  <span className="text-lg font-semibold">- $ {retencionIva.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                
                <div className="border-t border-white/10 pt-6 space-y-2">
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest text-center mb-4">Total a Liquidar</p>
                  <div className="flex justify-center items-baseline gap-1">
                    <span className="text-2xl font-light text-blue-400">$</span>
                    <span className="text-5xl font-black text-white tracking-tighter">
                      {totalPagar.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 mt-8">
                  <div className="flex justify-between text-[10px] text-gray-500 uppercase font-bold">
                    <span>Monto en letras</span>
                  </div>
                  <p className="text-[11px] text-blue-200 mt-1 italic">
                    CERO DÓLARES CON 00/100 USD
                  </p>
                </div>
              </div>

              <div className="mt-10">
                <button className="w-full py-4 bg-blue-500 hover:bg-blue-600 rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                  <CreditCardIcon className="w-5 h-5" />
                  CONFIRMAR Y EMITIR
                </button>
                <p className="text-[10px] text-gray-500 text-center mt-4 px-4 leading-relaxed">
                  Al emitir, el documento será firmado digitalmente y enviado automáticamente al Ministerio de Hacienda.
                </p>
              </div>
            </section>

            {/* QUICK HELP */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6">
              <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-2">
                <InformationCircleIcon className="w-4 h-4" /> Tip Pro
              </h4>
              <p className="text-xs text-blue-600/80 leading-relaxed">
                Recuerda que para contribuyentes de IVA, el NRC es obligatorio para aplicar crédito fiscal.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
