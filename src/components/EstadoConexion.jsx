export default function EstadoConexion({ estado }) {
  const estados = {
    online: {
      label: "🟢 Conectado",
      class: "text-green-600 bg-green-100",
    },
    contingencia: {
      label: "🟠 Contingencia",
      class: "text-orange-600 bg-orange-100",
    },
    error: {
      label: "🔴 Error de transmisión",
      class: "text-red-600 bg-red-100",
    },
  };

  return (
    <span
      className={`px-4 py-2 rounded-full text-sm font-medium ${estados[estado]?.class || "text-gray-600 bg-gray-100"}`}
      aria-live="polite" // Anuncia cambios de estado
    >
      {estados[estado]?.label || "Estado desconocido"}
    </span>
  );
}