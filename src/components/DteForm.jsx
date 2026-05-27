import { useState, useEffect } from "react";
import { CAT_DEPTO } from "../utils/catalogos/catDepto";
import { CAT_MUNICIPIO } from "../utils/catalogos/catMunicipio";

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

export default function DteForm({ defaultTipoDte }) {
  // --- STATE ---
  const createEmptyItem = (id = Date.now()) => ({
    id,
    unidadMedida: "Unidad",
    descripcion: "",
    cantidad: 1,
    precio: 0,
    total: 0,
    subTotalNoSujeto: 0,
    subTotalExento: 0,
    subTotalGravado: 0,
    descuento: 0,
    ventas: 0,
  });

  const [items, setItems] = useState([
    { ...createEmptyItem(1), descripcion: "Producto Ejemplo" }
  ]);

  const [emisor, setEmisor] = useState({
    nit: "056347175",
    nrc: "3400370",
    nombre: "CRISTIAN ALEJANDRO CAJUL BLANCO",
    actividad: "96092 - Servicios n.c.p.",
    direccion: "IZALCO, CTON. HUISCOYOLATE CRIO. EL CEGA",
    correo: "chrishalej997@gmail.com",
    telefono: "7448-4708",
    tipoDte: defaultTipoDte || "Factura Consumidor Final",
    fecha: new Date().toLocaleDateString('es-SV'),
    hora: new Date().toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  });

  const [receptor, setReceptor] = useState({
    tipoDoc: "NIT",
    numDoc: "",
    nombre: "",
    nrc: "",
    nombreComercial: "",
    actividadEconomica: "",
    departamento: "06",
    municipio: "23",
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

  const [docRelacionado, setDocRelacionado] = useState({
    tipoDoc: "Comprobante de Crédito Fiscal",
    tipoGeneracion: "Electrónica",
    codigoGeneracion: "",
    fechaGeneracion: ""
  });

  // --- LOGIC ---
  const agregarItem = () => {
    setItems([...items, createEmptyItem()]);
  };

  const eliminarItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'cantidad' || field === 'precio' || field === 'subTotalGravado' || field === 'descuento') {
          // Si estamos en Nota de Crédito o Débito, el total puede ser la suma de los desgloses
          if (emisor.tipoDte === "Nota de Crédito" || emisor.tipoDte === "Nota de Débito") {
            updated.total = (updated.subTotalNoSujeto || 0) + (updated.subTotalExento || 0) + (updated.subTotalGravado || 0);
          } else if (emisor.tipoDte === "Factura de Sujeto Excluido") {
            updated.ventas = (updated.cantidad * updated.precio) - (updated.descuento || 0);
            updated.total = updated.ventas;
          } else {
            updated.total = updated.cantidad * updated.precio;
            updated.subTotalGravado = updated.total;
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const isNota = emisor.tipoDte === "Nota de Crédito" || emisor.tipoDte === "Nota de Débito";
  const isSujetoExcluido = emisor.tipoDte === "Factura de Sujeto Excluido";

  const totalNoSujeto = items.reduce((acc, item) => acc + (item.subTotalNoSujeto || 0), 0);
  const totalExento = items.reduce((acc, item) => acc + (item.subTotalExento || 0), 0);
  const totalGravado = items.reduce((acc, item) => acc + (isNota ? (item.subTotalGravado || 0) : item.total), 0);

  const [ivaRetenido, setIvaRetenido] = useState(0);
  const [ivaPercibido, setIvaPercibido] = useState(0);
  const [retencionRenta, setRetencionRenta] = useState(0);
  const [retencionRentaPercent, setRetencionRentaPercent] = useState(10);

  const totalOperaciones = items.reduce((acc, item) => acc + (item.cantidad * item.precio), 0);
  const totalDescuento = items.reduce((acc, item) => acc + (item.descuento || 0), 0);

  const subTotalGeral = isSujetoExcluido ? (totalOperaciones - totalDescuento) : totalGravado;

  // Efecto para calcular retención de renta automáticamente si es Sujeto Excluido
  useEffect(() => {
    if (isSujetoExcluido) {
      setRetencionRenta((subTotalGeral * retencionRentaPercent) / 100);
    }
  }, [subTotalGeral, retencionRentaPercent, isSujetoExcluido]);

  const totalPagar = isSujetoExcluido
    ? (subTotalGeral - retencionRenta)
    : (totalGravado + totalNoSujeto + totalExento - ivaRetenido + ivaPercibido);

  const departamentos = CAT_DEPTO;
  const municipios = CAT_MUNICIPIO[receptor.departamento] || [];

  return (
    <div className="min-h-screen bg-gray-800 pb-12">
      {/* HEADER SECTION */}
      <div className="bg-[#1A2B3C] text-white pt-8 pb-16 px-6 mb-[-4rem]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <DocumentTextIcon className="w-8 h-8 text-blue-400" />
              {emisor.tipoDte}
            </h1>
            <p className="text-blue-200 mt-1 opacity-80">Sistema de Facturación Electrónica</p>
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

          {/* SECCIÓN EMISOR */}
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
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Documento</p>
                    <p className="text-sm font-bold text-blue-600">{emisor.tipoDte}</p>
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
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Dirección</p>
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
          {/*section de la nota de credito o debito*/}
          {isNota && (
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-purple-50/50 px-8 py-4 border-b border-gray-100 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-black">Información del Documento Relacionado</h3>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-black ml-1">Tipo de Documento</label>
                    <select
                      className="w-full bg-[#777778] border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                      value={docRelacionado.tipoDoc}
                      onChange={(e) => setDocRelacionado({ ...docRelacionado, tipoDoc: e.target.value })}
                    >
                      <option>Comprobante de Crédito Fiscal</option>
                      <option>Factura de Consumidor Final</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-black ml-1">Tipo de Generación</label>
                    <select
                      className="w-full bg-[#777778] border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                      value={docRelacionado.tipoGeneracion}
                      onChange={(e) => setDocRelacionado({ ...docRelacionado, tipoGeneracion: e.target.value })}
                    >
                      <option>Electrónica</option>
                      <option>Papel / Otros</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-black ml-1">Código de Generación / Correlativo</label>
                    <input
                      type="text"
                      placeholder="Ingrese el número de documento"
                      className="w-full bg-[#777778] border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                      value={docRelacionado.codigoGeneracion}
                      onChange={(e) => setDocRelacionado({ ...docRelacionado, codigoGeneracion: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-black ml-1">Fecha de Generación</label>
                    <input
                      type="date"
                      className="w-full bg-[#777778] border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                      value={docRelacionado.fechaGeneracion}
                      onChange={(e) => setDocRelacionado({ ...docRelacionado, fechaGeneracion: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* SECCIÓN RECEPTOR */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50/50 px-8 py-4 border-b border-gray-100 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-black" />
              <h3 className="font-bold text-black">{isSujetoExcluido ? 'Sujeto Excluido' : 'Información del Receptor'}</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-black ml-1">Tipo Documento</label>
                    <select
                      className="w-full bg-[#777778] border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                      value={receptor.tipoDoc}
                      onChange={(e) => setReceptor({ ...receptor, tipoDoc: e.target.value })}
                    >
                      <option>NIT</option>
                      <option>DUI</option>
                      <option>Otro</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 ml-1">{receptor.tipoDoc}</label>
                    <input
                      type="text"
                      placeholder={`Digite el número de ${receptor.tipoDoc}`}
                      className="w-full bg-[#777778] border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      value={receptor.numDoc}
                      onChange={(e) => setReceptor({ ...receptor, numDoc: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 ml-1">{isSujetoExcluido ? 'Nombre del Receptor' : 'Nombre del Cliente'}</label>
                  <input
                    type="text"
                    placeholder={isSujetoExcluido ? 'Nombre completo del receptor' : 'Nombre completo del cliente'}
                    className="w-full bg-[#777778] border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={receptor.nombre}
                    onChange={(e) => setReceptor({ ...receptor, nombre: e.target.value })}
                  />
                </div>
                {!isSujetoExcluido && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 ml-1">NRC</label>
                      <input
                        type="text"
                        placeholder="Número de NRC"
                        className="w-full bg-[#777778] border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        value={receptor.nrc}
                        onChange={(e) => setReceptor({ ...receptor, nrc: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 ml-1">Nombre Comercial</label>
                      <input
                        type="text"
                        placeholder="Personalizar nombre comercial"
                        className="w-full bg-[#777778] border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        value={receptor.nombreComercial}
                        onChange={(e) => setReceptor({ ...receptor, nombreComercial: e.target.value })}
                      />
                    </div>
                  </>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Actividad Económica</label>
                  <input
                    type="text"
                    placeholder="Actividad económica"
                    className="w-full bg-[#777778] border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={receptor.actividadEconomica}
                    onChange={(e) => setReceptor({ ...receptor, actividadEconomica: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Departamento</label>
                      <select
                        className="w-full bg-[#777778] border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                        value={receptor.departamento}
                        onChange={(e) => {
                          const depto = e.target.value;
                          const firstMuni = CAT_MUNICIPIO[depto]?.[0]?.codigo || "";
                          setReceptor({ ...receptor, departamento: depto, municipio: firstMuni });
                        }}
                      >
                        <option value="">Seleccione Departamento</option>
                        {departamentos.map(d => <option key={d.codigo} value={d.codigo}>{d.codigo} - {d.descripcion}</option>)}
                      </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Municipio</label>
                      <select
                        className="w-full bg-[#777778] border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                        value={receptor.municipio}
                        onChange={(e) => setReceptor({ ...receptor, municipio: e.target.value })}
                      >
                        <option value="">Seleccione Municipio</option>
                        {municipios.map(m => <option key={m.codigo} value={m.codigo}>{m.codigo} - {m.descripcion}</option>)}
                      </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Dirección Complemento</label>
                  <textarea
                    placeholder="Digite el complemento de la dirección"
                    rows="2"
                    className="w-full bg-[#777778] border border-gray-200 rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                    value={receptor.complemento}
                    onChange={(e) => setReceptor({ ...receptor, complemento: e.target.value })}
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Correo electrónico</label>
                    <input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      className="w-full bg-[#777778] border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                      value={receptor.correo}
                      onChange={(e) => setReceptor({ ...receptor, correo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Teléfono</label>
                    <input
                      type="text"
                      placeholder="7000-0000"
                      className="w-full bg-[#777778] border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                      value={receptor.telefono}
                      onChange={(e) => setReceptor({ ...receptor, telefono: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN PRODUCTOS */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50/50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingCartIcon className="w-5 h-5 text-black" />
                <h3 className="font-bold text-gray-700">Detalle de la Operación</h3>
              </div>
              <button
                onClick={agregarItem}
                className="inline-flex items-center px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-1" /> AGREGAR ITEM
              </button>
            </div>
            {/*tabla para mostrar los items*/}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-black uppercase tracking-[0.15em] border-b border-gray-50">
                    <th className="py-4 px-8 font-bold">{isSujetoExcluido ? 'Descripción' : (isNota ? 'Cantidad' : 'Unidad de Medida')}</th>
                    <th className="py-4 px-4 font-bold">{isSujetoExcluido ? 'Unidad de Medida' : 'Descripción'}</th>
                    <th className="py-4 px-4 font-bold w-24">{isSujetoExcluido ? 'Cantidad' : (isNota ? 'Precio' : 'Cantidad')}</th>
                    {!isNota && <th className="py-4 px-4 font-bold w-32">{isSujetoExcluido ? 'Precio' : 'Precio'}</th>}
                    {isNota ? (
                      <>
                        <th className="py-4 px-4 font-bold w-32 text-center">No sujeto</th>
                        <th className="py-4 px-4 font-bold w-32 text-center">Exento</th>
                        <th className="py-4 px-4 font-bold w-32 text-center">Gravado</th>
                      </>
                    ) : (
                      isSujetoExcluido ? (
                        <>
                          <th className="py-4 px-4 font-bold w-32 text-center text-[8px]">Descuento, Bonificación, Rebajas por ítem</th>
                          <th className="py-4 px-4 font-bold w-32 text-center">Ventas</th>
                        </>
                      ) : (
                        <th className="py-4 px-4 font-bold w-32">Sub Total</th>
                      )
                    )}
                    <th className="py-4 px-8 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((item) => (
                    <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-8">
                        {isSujetoExcluido ? (
                          <input
                            type="text"
                            placeholder="Descripción..."
                            className="w-full bg-transparent border-none text-sm text-gray-800 placeholder-gray-300 focus:ring-0 outline-none"
                            value={item.descripcion}
                            onChange={(e) => updateItem(item.id, 'descripcion', e.target.value)}
                          />
                        ) : (
                          isNota ? (
                            <input
                              type="number"
                              className="w-16 bg-gray-100/50 border-none rounded-lg px-2 py-1 text-sm font-medium text-gray-700"
                              value={item.cantidad}
                              onChange={(e) => updateItem(item.id, 'cantidad', parseFloat(e.target.value) || 0)}
                            />
                          ) : (
                            <select
                              className="bg-transparent border-none text-sm text-gray-600 focus:ring-0 outline-none"
                              value={item.unidadMedida}
                              onChange={(e) => updateItem(item.id, 'unidadMedida', e.target.value)}
                            >
                              <option>Unidad</option>
                              <option>Servicio</option>
                              <option>Peso</option>
                            </select>
                          )
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {isSujetoExcluido ? (
                          <select
                            className="bg-transparent border-none text-sm text-gray-600 focus:ring-0 outline-none"
                            value={item.unidadMedida}
                            onChange={(e) => updateItem(item.id, 'unidadMedida', e.target.value)}
                          >
                            <option>Unidad</option>
                            <option>Servicio</option>
                            <option>Peso</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder="Descripción del producto..."
                            className="w-full bg-transparent border-none text-sm text-gray-800 placeholder-gray-300 focus:ring-0 outline-none"
                            value={item.descripcion}
                            onChange={(e) => updateItem(item.id, 'descripcion', e.target.value)}
                          />
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          {(isSujetoExcluido || !isNota) ? (
                            <input
                              type="number"
                              className="w-16 bg-gray-100/50 border-none rounded-lg px-2 py-1 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500/20"
                              value={item.cantidad}
                              onChange={(e) => updateItem(item.id, 'cantidad', parseFloat(e.target.value) || 0)}
                            />
                          ) : (
                            <>
                              <span className="text-gray-400 text-xs">$</span>
                              <input
                                type="number"
                                className="w-24 bg-transparent border-none p-0 text-sm font-medium text-gray-700 focus:ring-0"
                                value={item.precio}
                                onChange={(e) => updateItem(item.id, 'precio', parseFloat(e.target.value) || 0)}
                              />
                            </>
                          )}
                        </div>
                      </td>
                      {!isNota && (
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
                      )}
                      {isNota ? (
                        <>
                          <td className="py-4 px-4">
                            <input
                              type="number"
                              className="w-24 bg-gray-50 border border-gray-100 rounded px-2 py-1 text-sm text-right focus:ring-1 focus:ring-purple-200 outline-none"
                              value={item.subTotalNoSujeto}
                              onChange={(e) => updateItem(item.id, 'subTotalNoSujeto', parseFloat(e.target.value) || 0)}
                            />
                          </td>
                          <td className="py-4 px-4">
                            <input
                              type="number"
                              className="w-24 bg-gray-50 border border-gray-100 rounded px-2 py-1 text-sm text-right focus:ring-1 focus:ring-purple-200 outline-none"
                              value={item.subTotalExento}
                              onChange={(e) => updateItem(item.id, 'subTotalExento', parseFloat(e.target.value) || 0)}
                            />
                          </td>
                          <td className="py-4 px-4">
                            <input
                              type="number"
                              className="w-24 bg-gray-50 border border-gray-100 rounded px-2 py-1 text-sm text-right focus:ring-1 focus:ring-purple-200 outline-none font-bold text-gray-900"
                              value={item.subTotalGravado}
                              onChange={(e) => updateItem(item.id, 'subTotalGravado', parseFloat(e.target.value) || 0)}
                            />
                          </td>
                        </>
                      ) : (
                        isSujetoExcluido ? (
                          <>
                            <td className="py-4 px-4">
                              <input
                                type="number"
                                className="w-24 bg-gray-50 border border-gray-100 rounded px-2 py-1 text-sm text-right focus:ring-1 focus:ring-blue-200 outline-none"
                                value={item.descuento}
                                onChange={(e) => updateItem(item.id, 'descuento', parseFloat(e.target.value) || 0)}
                              />
                            </td>
                            <td className="py-4 px-4 text-sm font-bold text-gray-900 text-right">$ {item.ventas.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          </>
                        ) : (
                          <td className="py-4 px-4 text-sm font-bold text-gray-900">$ {item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        )
                      )}
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
          {/*Condiciones de operacion y forma de pago */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <CreditCardIcon className="w-5 h-5 text-black" />
                <h3 className="font-bold text-black">Condición de la Operación</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-black">Condición</label>
                  <select
                    className="w-full bg-[#777778] border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                    value={pago.condicion}
                    onChange={(e) => setPago({ ...pago, condicion: e.target.value })}
                  >
                    <option>Contado</option>
                    <option>Crédito</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-black">Forma Pago</label>
                  <select
                    className="w-full bg-[#777778] border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                    value={pago.metodo}
                    onChange={(e) => setPago({ ...pago, metodo: e.target.value })}
                  >
                    <option>Billetes y monedas</option>
                    <option>Tarjeta de Crédito</option>
                    <option>Transferencia</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-black">Monto</label>
                <input
                  type="number"
                  placeholder="Monto Pago"
                  className="w-full bg-gray-50 text-black border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div className="overflow-x-auto pt-4">
                <table className="w-full text-[10px] text-left">
                  <thead>
                    <tr className="text-black uppercase font-bold border-b border-gray-50">
                      <th className="pb-2 pr-2">Forma de Pago</th>
                      <th className="pb-2 px-2 text-right">Monto</th>
                      <th className="pb-2 px-2">No. Documento</th>
                      <th className="pb-2 px-2">Plazo</th>
                      <th className="pb-2 pl-2">Período</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-50/50">
                      <td className="py-2 pr-2 text-black">{pago.metodo}</td>
                      <td className="py-2 px-2 text-right font-medium text-black">$ {totalPagar.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="py-2 px-2 text-black italic">N/A</td>
                      <td className="py-2 px-2 text-black italic">N/A</td>
                      <td className="py-2 pl-2 text-black italic">N/A</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-black">Observaciones</label>
                <textarea
                  className="w-full bg-black border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none resize-none"
                  rows={isNota ? 6 : 3}
                  placeholder="Observaciones al documento"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                ></textarea>
              </div>
            </section>
            {/*seccion de datos adicionales de entrega */}
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <InformationCircleIcon className="w-5 h-5 text-black" />
                <h3 className="font-bold text-gray-700">{isNota ? 'Información obligatoria, recepción entrega documento' : 'Datos adicionales entrega'}</h3>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-blue-600 uppercase">
                    {isNota ? 'Responsable por parte del Emisor' : 'Responsable de emitir el documento'}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-black ml-1 uppercase">N°. Documento</label>
                      <input
                        type="text"
                        placeholder="Responsable de emitir"
                        className="w-full text-black bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500"
                        value={responsables.emisorDoc}
                        onChange={(e) => setResponsables({ ...responsables, emisorDoc: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-black ml-1 uppercase">Nombre</label>
                      <input
                        type="text"
                        placeholder="Responsable de emitir"
                        className="w-full text-black bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500"
                        value={responsables.emisorNombre}
                        onChange={(e) => setResponsables({ ...responsables, emisorNombre: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-50">
                  <p className="text-[10px] font-bold text-gray-600 uppercase">
                    {isNota ? 'Responsable por parte del Receptor' : 'Responsable de recibir el documento'}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-black ml-1 uppercase">N°. Documento</label>
                      <input
                        type="text"
                        placeholder="Responsable de recibir"
                        className="w-full text-black bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500"
                        value={responsables.receptorDoc}
                        onChange={(e) => setResponsables({ ...responsables, receptorDoc: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-black ml-1 uppercase">Nombre</label>
                      <input
                        type="text"
                        placeholder="Responsable de recibir"
                        className="w-full  text-black bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500"
                        value={responsables.receptorNombre}
                        onChange={(e) => setResponsables({ ...responsables, receptorNombre: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* COLUMNA DERECHA (RESUMEN FINANCIERO) */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            <section className="bg-[#1A2B3C] text-white rounded-[2.5rem] shadow-2xl p-10 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                Resumen de Operación
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm font-medium">
                    {isSujetoExcluido ? 'Total de Operaciones' : (isNota ? 'Total Gravadas' : 'Total Gravado')}
                  </span>
                  <span className="text-lg font-semibold">$ {isSujetoExcluido ? totalOperaciones.toLocaleString('en-US', { minimumFractionDigits: 2 }) : totalGravado.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>

                {isSujetoExcluido && (
                  <>
                    <div className="flex justify-between items-center text-blue-300">
                      <span className="text-sm font-medium">Descuento Global</span>
                      <span className="text-lg font-semibold">$ 0.00</span>
                    </div>
                    <div className="flex justify-between items-center text-blue-300">
                      <span className="text-sm font-medium">Total monto de descuento</span>
                      <span className="text-lg font-semibold">$ {totalDescuento.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </>
                )}

                {!isSujetoExcluido && (
                  <>
                    <div className="flex justify-between items-center text-red-400">
                      <span className="text-sm font-medium">IVA Retenido</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs">$</span>
                        <input
                          type="number"
                          className="w-20 bg-white/10 border-none rounded px-2 py-0.5 text-right text-sm font-semibold outline-none focus:ring-1 focus:ring-red-400"
                          value={ivaRetenido}
                          onChange={(e) => setIvaRetenido(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-green-400">
                      <span className="text-sm font-medium">{isNota ? 'Percepción IVA' : 'IVA Percibido'}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs">$</span>
                        <input
                          type="number"
                          className="w-20 bg-white/10 border-none rounded px-2 py-0.5 text-right text-sm font-semibold outline-none focus:ring-1 focus:ring-green-400"
                          value={ivaPercibido}
                          onChange={(e) => setIvaPercibido(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                  <span className="text-gray-400 text-sm font-medium">Sub Total</span>
                  <span className="text-lg font-semibold">$ {subTotalGeral.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>

                {isSujetoExcluido && (
                  <div className="flex justify-between items-center text-orange-400">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Retención Renta</span>
                      <div className="flex items-center bg-white/10 rounded px-1">
                        <input
                          type="number"
                          className="w-8 bg-transparent border-none p-0 text-[10px] text-center font-bold outline-none"
                          value={retencionRentaPercent}
                          onChange={(e) => setRetencionRentaPercent(parseFloat(e.target.value) || 0)}
                        />
                        <span className="text-[10px] opacity-50">%</span>
                      </div>
                    </div>
                    <span className="text-lg font-semibold">$ {retencionRenta.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="border-t border-white/10 pt-6 space-y-2">
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest text-center mb-4">
                    {isSujetoExcluido ? 'Total a pagar' : (isNota ? 'Monto Total de la operación' : 'Total a Pagar')}
                  </p>
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
                  <p className="text-[11px] text-blue-200 mt-1 italic uppercase">
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
          </div>
        </div>

      </div>
    </div>
  );
}
