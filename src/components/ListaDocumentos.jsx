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
          <div key={doc.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={doc.seleccionado}
              onChange={() => toggleSeleccion(doc.id)}
              className="w-4 h-4 text-blue-600"
              aria-label={`Seleccionar ${doc.nombre}`}
            />
            <span className="text-sm">{doc.nombre}</span>
          </div>
        ))
      )}
    </div>
  );
}