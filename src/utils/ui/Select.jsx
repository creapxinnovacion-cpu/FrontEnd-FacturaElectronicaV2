export default function Select({
  name,
  value,
  onChange,
  options = [],
  placeholder,
  error,
}) {
  return (
    <div className="space-y-1">
      <select
        name={name}
        value={value ?? ""}
        onChange={onChange}
        className={`w-full border-gray-500 bg-[#777778] text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2
        ${error
            ? "border-red-500 focus:ring-red-400"
            : "border-gray-300 focus:ring-blue-500"
          }`}
      >
        <option value="">{placeholder}</option>

        {options.map((opt, index) => (
          <option key={`${opt.codigo || opt.id || index}-${index}`} value={opt.codigo ?? opt.id ?? opt.value ?? ""}>
            {opt.descripcion || opt.label || opt.nombre}
          </option>
        ))}
      </select>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
