export default function ResumenCard({ titulo, valor, color, icon }) {
  const colorMap = {
    green: {
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
      accent: "text-emerald-600",
      border: "border-l-emerald-500",
    },
    orange: {
      badge: "bg-amber-50 text-amber-700 border-amber-200/60",
      accent: "text-amber-600",
      border: "border-l-amber-500",
    },
    red: {
      badge: "bg-rose-50 text-rose-700 border-rose-200/60",
      accent: "text-rose-600",
      border: "border-l-rose-500",
    },
  };

  const theme = colorMap[color] || colorMap.green;

  return (
    <div className={`bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs border-l-4 ${theme.border} flex items-center justify-between transition-all duration-200 hover:shadow-md hover:border-slate-300`}>
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {titulo}
        </p>
        <p className="text-3xl font-bold text-slate-900 tabular-nums">
          {valor}
        </p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${theme.badge}`}>
        {icon}
      </div>
    </div>
  );
}