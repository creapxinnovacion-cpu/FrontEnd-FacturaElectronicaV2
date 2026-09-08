import { batchService } from "../services/api/batch.service";
import { DocumentArrowDownIcon, EyeIcon } from "@heroicons/react/24/outline";

export default function ListaDocumentos({ documentos, setDocumentos }) {
  const toggleSeleccion = (id) => {
    setDocumentos((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, seleccionado: !doc.seleccionado } : doc))
    );
  };

  return (
    <div className="space-y-2">
      {documentos.length === 0 ? (
        <p className="text-gray-500">No hay documentos pendientes.</p>
      ) : (
        documentos.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100/80 rounded-xl transition border border-gray-200/60">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={doc.seleccionado}
                onChange={() => toggleSeleccion(doc.id)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                aria-label={`Seleccionar ${doc.nombre}`}
              />
              <div>
                <span className="text-sm font-semibold text-gray-800">{doc.nombre}</span>
                <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-blue-100 text-blue-700">
                  {doc.estado}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={batchService.getPdfUrl(doc.id, true)}
                target="_blank"
                rel="noopener noreferrer"
                title="Ver PDF"
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                <EyeIcon className="w-5 h-5" />
              </a>
              <button
                type="button"
                onClick={() => batchService.downloadPdf(doc.id)}
                title="Descargar PDF"
                className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}