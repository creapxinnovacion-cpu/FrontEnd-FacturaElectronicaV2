import { useState, useEffect } from "react";
import {
  XCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  PrinterIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { batchService } from "../services/api/batch.service";
import { eventoService } from "../services/api/evento.service";
import { CAT_TIPO_INVALIDACION } from "../utils/catalogos/catInvalidacion";
import { CAT_TIPO_DOCUMENTO_IDENTIFICACION } from "../utils/catalogos/CatTipoDocumentoIdentificacion";

export default function Anulaciones() {
  const [dtes, setDtes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDte, setSelectedDte] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [alerta, setAlerta] = useState({ tipo: "", mensaje: "" });
  const [vistaImpresion, setVistaImpresion] = useState(null);

  // Formulario del Evento de Invalidación
  const [formData, setFormData] = useState({
    tipo_invalidacion: 1,
    motivo: "",
    responsable_nombre: "ADMINISTRADOR FISCAL",
    responsable_doc_tipo: "36",
    responsable_doc_num: "06140101901010",
    solicita_nombre: "",
    solicita_doc_tipo: "36",
    solicita_doc_num: "",
    codigo_generacion_reemplazo: "",
  });

  useEffect(() => {
    cargarDtes();
  }, []);

  const cargarDtes = async () => {
    setLoading(true);
    try {
      const response = await batchService.getAll();
      setDtes(response.data || []);
    } catch (err) {
      console.error("Error al cargar DTEs:", err);
      setAlerta({ tipo: "error", mensaje: "No se pudieron cargar los DTEs desde el servidor." });
    } finally {
      setLoading(false);
    }
  };

  const abrirModalInvalidacion = (dte) => {
    setSelectedDte(dte);
    setFormData({
      tipo_invalidacion: 1,
      motivo: "",
      responsable_nombre: dte.emisor?.nombre || "EMISOR RESPONSABLE",
      responsable_doc_tipo: "36",
      responsable_doc_num: dte.emisor?.nit || "",
      solicita_nombre: dte.receptor_nombre || "CLIENTE SOLICITANTE",
      solicita_doc_tipo: "36",
      solicita_doc_num: dte.receptor_documento || "",
      codigo_generacion_reemplazo: "",
    });
    setModalOpen(true);
  };

  const handleInvalidarSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDte) return;

    setSubmitting(true);
    setAlerta({ tipo: "", mensaje: "" });

    try {
      const payload = {
        dte_id: selectedDte.id,
        ...formData,
      };

      const res = await eventoService.invalidarDte(payload);
      setAlerta({
        tipo: "success",
        mensaje: `Documento invalidado con éxito. Evento UUID: ${res.data.invalidacion?.codigo_generacion}`,
      });
      setModalOpen(false);
      setVistaImpresion(res.data.invalidacion);
      cargarDtes();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || "Error al procesar la invalidación.";
      setAlerta({ tipo: "error", mensaje: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  // Cálculo local aproximado de vigencia del plazo V2.0
  const evaluarPlazoDte = (dte) => {
    if (dte.estado_actual === "ANULADO") {
      return { vigente: false, etiqueta: "DOCUMENTO ANULADO", clase: "bg-red-100 text-red-700" };
    }

    const fechaEmision = new Date(dte.fecha_emision);
    const ahora = new Date();
    const diffDias = Math.floor((ahora - fechaEmision) / (1000 * 60 * 60 * 24));

    // DTE 01 (Factura) o 14: 90 días (3 meses)
    if (dte.tipo_dte === 1 || dte.tipo_dte === 9 || dte.tipo_dte === 8) {
      if (diffDias <= 90) {
        return { vigente: true, etiqueta: `Plazo Vigente (${90 - diffDias} días rest.)`, clase: "bg-emerald-100 text-emerald-800" };
      }
      return { vigente: false, etiqueta: "Plazo Vencido (> 3 meses)", clase: "bg-gray-100 text-gray-600" };
    }

    // CCF (03) y otros: ~10 días hábiles del mes siguiente
    if (diffDias <= 40) {
      return { vigente: true, etiqueta: "Plazo Hábil Vigente", clase: "bg-emerald-100 text-emerald-800" };
    }
    return { vigente: false, etiqueta: "Plazo Vencido", clase: "bg-gray-100 text-gray-600" };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* HEADER EXPLICATIVO NORMATIVA V2.0 */}
      <header className="bg-gradient-to-r from-red-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-600/30 border border-red-500/40 rounded-2xl">
              <ExclamationTriangleIcon className="w-9 h-9 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Módulo de Invalidaciones (Normativa DTE V2.0)</h1>
              <p className="text-red-200 text-xs mt-1 max-w-2xl leading-relaxed">
                Plazos legales actualizados por el Ministerio de Hacienda: <strong className="text-white">10 días hábiles del mes siguiente</strong> para Crédito Fiscal (03), Retención y Notas; y hasta <strong className="text-white">3 meses</strong> para Facturas de Consumidor Final (01) y Sujeto Excluido.
              </p>
            </div>
          </div>
          <button
            onClick={cargarDtes}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition backdrop-blur-sm"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar Listado
          </button>
        </div>
      </header>

      {/* ALERTAS */}
      {alerta.mensaje && (
        <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-md ${alerta.tipo === 'success'
          ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
          {alerta.tipo === 'success' ? (
            <CheckCircleIcon className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          ) : (
            <XCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
          )}
          <span>{alerta.mensaje}</span>
        </div>
      )}

      {/* TABLA DE DOCUMENTOS EMITIDOS */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-bold text-gray-800">Documentos Tributarios Emitidos</h3>
            <p className="text-xs text-gray-400 mt-0.5">Seleccione un documento para tramitar su Evento de Invalidación ante Hacienda</p>
          </div>
          <span className="text-xs font-semibold bg-gray-200/60 px-3 py-1 rounded-full text-gray-600">
            Total: {dtes.length} DTEs
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
            <p className="text-sm font-medium">Cargando documentos tributarios...</p>
          </div>
        ) : dtes.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-600">No hay documentos registrados</p>
            <p className="text-xs text-gray-400 mt-1">Los documentos emitidos en el POS o facturación aparecerán aquí.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/80">
                <tr className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">
                  <th className="px-6 py-4">Código Generación / DTE</th>
                  <th className="px-6 py-4">Receptor</th>
                  <th className="px-6 py-4">Fecha Emisión</th>
                  <th className="px-6 py-4">Monto Total</th>
                  <th className="px-6 py-4">Plazo Legal V2.0</th>
                  <th className="px-6 py-4">Estado Actual</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {dtes.map((item) => {
                  const plazo = evaluarPlazoDte(item);
                  const esAnulado = item.estado_actual === "ANULADO";

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-6 py-4">
                        <p className="font-mono text-xs font-bold text-gray-800">{item.codigo_generacion}</p>
                        <p className="text-[11px] text-gray-400">{item.numero_control || "Sin número control"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-700">{item.receptor_nombre}</p>
                        <p className="text-xs text-gray-400">{item.receptor_documento || "Doc no especificado"}</p>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600 font-medium">
                        {item.fecha_emision} {item.hora_emision}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800">
                        $ {parseFloat(item.total_pagar || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${plazo.clase}`}>
                          {plazo.etiqueta}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${esAnulado
                          ? "bg-red-100 text-red-700"
                          : item.estado_actual === "ACEPTADO"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                          }`}>
                          {item.estado_actual}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {esAnulado ? (
                          <span className="text-xs font-semibold text-gray-400 italic">Ya invalidado</span>
                        ) : (
                          <button
                            onClick={() => abrirModalInvalidacion(item)}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition transform active:scale-95"
                          >
                            INVALIDAR
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE INVALIDACIÓN */}
      {modalOpen && selectedDte && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                  Emitir Evento de Invalidación
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  DTE a afectar: <span className="font-mono font-bold text-gray-800">{selectedDte.codigo_generacion}</span>
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInvalidarSubmit} className="space-y-4">
              {/* MOTIVO CAT-024 */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase">
                  Tipo de Invalidación (CAT-024) *
                </label>
                <select
                  value={formData.tipo_invalidacion}
                  onChange={(e) => setFormData({ ...formData, tipo_invalidacion: parseInt(e.target.value) })}
                  className="w-full bg-[#777778] text-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-red-500/20 outline-none"
                  required
                >
                  {CAT_TIPO_INVALIDACION.map((mot) => (
                    <option key={mot.id} value={mot.id}>
                      {mot.codigo} - {mot.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              {/* DESCRIPCIÓN DEL MOTIVO */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase">
                  Motivo o justificación de la invalidación *
                </label>
                <textarea
                  rows="3"
                  placeholder="Explique detalladamente la razón de la invalidación..."
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  className="w-full border bg-[#777778] text-white border-gray-200 rounded-2xl px-4 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-red-500/20 outline-none"
                  required
                ></textarea>
              </div>

              {/* RESPONSABLE Y SOLICITANTE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Responsable de emisión *</label>
                  <input
                    type="text"
                    value={formData.responsable_nombre}
                    onChange={(e) => setFormData({ ...formData, responsable_nombre: e.target.value })}
                    className="w-full bg-[#777778] text-white border border-gray-200 rounded-2xl px-4 py-2 text-sm bg-gray-50 outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Doc. Responsable *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select
                      value={formData.responsable_doc_tipo}
                      onChange={(e) => setFormData({ ...formData, responsable_doc_tipo: e.target.value })}
                      className="border bg-[#777778] text-white border-gray-200 rounded-2xl px-3 py-2 text-xs bg-gray-50 outline-none"
                    >
                      {CAT_TIPO_DOCUMENTO_IDENTIFICACION.map((doc) => (
                        <option key={doc.codigo} value={doc.codigo}>
                          {doc.descripcion} ({doc.codigo})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={formData.responsable_doc_num}
                      onChange={(e) => setFormData({ ...formData, responsable_doc_num: e.target.value })}
                      placeholder="Número doc."
                      className="sm:col-span-2 bg-[#777778] text-white border border-gray-200 rounded-2xl px-4 py-2 text-sm bg-gray-50 outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Solicitante (Cliente/Receptor) *</label>
                  <input
                    type="text"
                    value={formData.solicita_nombre}
                    onChange={(e) => setFormData({ ...formData, solicita_nombre: e.target.value })}
                    className="w-full border bg-[#777778] text-white border-gray-200 rounded-2xl px-4 py-2 text-sm bg-gray-50 outline-none"
                    placeholder="Opcional"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Doc. Solicitante *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select
                      value={formData.solicita_doc_tipo}
                      onChange={(e) => setFormData({ ...formData, solicita_doc_tipo: e.target.value })}
                      className="border bg-[#777778] text-white border-gray-200 rounded-2xl px-3 py-2 text-xs bg-gray-50 outline-none"
                    >
                      {CAT_TIPO_DOCUMENTO_IDENTIFICACION.map((doc) => (
                        <option key={doc.codigo} value={doc.codigo}>
                          {doc.descripcion} ({doc.codigo})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={formData.solicita_doc_num}
                      onChange={(e) => setFormData({ ...formData, solicita_doc_num: e.target.value })}
                      placeholder="Número doc. (Opcional)"
                      className="sm:col-span-2 border bg-[#777778] text-white border-gray-200 rounded-2xl px-4 py-2 text-sm bg-gray-50 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* DTE REEMPLAZO SI APLICA */}
              {formData.tipo_invalidacion === 1 && (
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-blue-700 uppercase">
                    Código de Generación del DTE de Reemplazo (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="UUID v4 del documento que reemplaza este DTE"
                    value={formData.codigo_generacion_reemplazo}
                    onChange={(e) => setFormData({ ...formData, codigo_generacion_reemplazo: e.target.value })}
                    className="w-full border border-blue-200 bg-blue-50/50 rounded-2xl px-4 py-2 text-sm outline-none font-mono"
                  />
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-600/30 transition"
                >
                  {submitting ? "Transmitiendo a Hacienda..." : "Confirmar e Invalidar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPRESENTACIÓN GRÁFICA DEL EVENTO DE INVALIDACIÓN (IMPRESIÓN) */}
      {vistaImpresion && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-200 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="w-8 h-8 text-emerald-600" />
              <div>
                <h4 className="font-bold text-gray-800">Representación Gráfica del Evento de Invalidación</h4>
                <p className="text-xs text-gray-500">Documento de entrega obligatoria al receptor según Normativa V2.0</p>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/20"
            >
              <PrinterIcon className="w-4 h-4" /> Imprimir Comprobante
            </button>
          </div>

          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-mono space-y-2">
            <p><strong>CÓDIGO GENERACIÓN EVENTO:</strong> {vistaImpresion.codigo_generacion}</p>
            <p><strong>SELLO RECEPCIÓN MH:</strong> {vistaImpresion.sello_recepcion || "OTORGADO POR DGII"}</p>
            <p><strong>FECHA PROCESO:</strong> {new Date().toLocaleString('es-SV')}</p>
            <p><strong>MOTIVO:</strong> {vistaImpresion.motivo}</p>
            <p><strong>RESPONSABLE:</strong> {vistaImpresion.responsable_nombre} ({vistaImpresion.responsable_doc_num})</p>
            <p><strong>SOLICITANTE:</strong> {vistaImpresion.solicita_nombre} ({vistaImpresion.solicita_doc_num})</p>
          </div>
        </div>
      )}
    </div>
  );
}
