export default function ResumenCard({ titulo, valor, color, icon }) {
  const colores = {
    green: "bg-green-50 text-green-700 border-green-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className={`rounded-2xl p-5 shadow border ${colores[color]} flex items-center space-x-3`}>
      {icon}
      <div>
        <p className="text-sm">{titulo}</p>
        <p className="text-3xl font-bold">{valor}</p>
      </div>
    </div>
  );
}