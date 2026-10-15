export default function EstadoConexion({ estado }) {
  const configs = {
    online: {
      label: "MH en Línea",
      sublabel: "Servidores DGII Operativos",
      badge: "bg-emerald-50 text-emerald-800 border-emerald-200/70",
      dot: "bg-emerald-500",
      ping: "bg-emerald-400",
    },
    contingencia: {
      label: "Modo Contingencia",
      sublabel: "Buffer Local Activo",
      badge: "bg-amber-50 text-amber-800 border-amber-200/70",
      dot: "bg-amber-500",
      ping: "bg-amber-400",
    },
    error: {
      label: "Falla de Conexión",
      sublabel: "Retransmisión Pendiente",
      badge: "bg-rose-50 text-rose-800 border-rose-200/70",
      dot: "bg-rose-500",
      ping: "bg-rose-400",
    },
  };

  const current = configs[estado] || {
    label: "Estado Desconocido",
    sublabel: "Verificando...",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
    ping: "bg-slate-300",
  };

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold shadow-2xs ${current.badge}`}
      aria-live="polite"
    >
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.ping}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dot}`}></span>
      </span>
      <span>{current.label}</span>
    </div>
  );
}