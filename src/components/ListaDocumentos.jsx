import { batchService } from "../services/api/batch.service";
import { DocumentArrowDownIcon, EyeIcon } from "@heroicons/react/24/outline";

export default function ListaDocumentos({ documentos, setDocumentos }) {
  const toggleSeleccion = (id) => {
    setDocumentos((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, seleccionado: !doc.seleccionado } : doc))
    );
  };

  const getStatusBadge = (estado, isOffline) => {
    if (isOffline) {
      return "bg-amber-50 text-amber-700 border-amber-200/80";
    }
    switch (estado) {
      case "ACEPTADO":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "RECHAZADO":
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      case "CONTINGENCIA":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "FIRMADO":
      case "REGISTRADO":
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/80";
    }
  };

  return (
    <div className="space-y-2">
      {documentos.length === 0 ? (
        <div className="py-12 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <p className="text-sm text-slate-500 font-medium">No hay documentos pendientes de transmisión o firma.</p>
        </div>
      ) : (
        documentos.map((doc) => (
          <div
            key={doc.id}
            className={`flex items-center justify-between p-3.5 rounded-xl transition-all duration-150 border ${
              doc.seleccionado
                ? "bg-blue-50/40 border-blue-300 shadow-2xs"
                : "bg-white hover:bg-slate-50/80 border-slate-200/70"
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <input
                type="checkbox"
                checked={doc.seleccionado}
                onChange={() => toggleSeleccion(doc.id)}
                className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500 cursor-pointer"
                aria-label={`Seleccionar ${doc.nombre}`}
              />
              <div className="flex items-center gap-2.5 truncate">
                <span className="text-sm font-semibold text-slate-800 truncate font-mono-code">
                  {doc.nombre}
                </span>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${getStatusBadge(
                    doc.estado,
                    doc.isOffline
                  )}`}
                >
                  {doc.estado}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
              <a
                href={batchService.getPdfUrl(doc.id, true)}
                target="_blank"
                rel="noopener noreferrer"
                title="Ver Representación Gráfica (PDF)"
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <EyeIcon className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => batchService.downloadPdf(doc.id)}
                title="Descargar PDF"
                className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}