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
        value={value}
        onChange={onChange}
        className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2
        ${
          error
            ? "border-red-500 focus:ring-red-400"
            : "border-gray-300 focus:ring-blue-500"
        }`}
      >
        <option value="">{placeholder}</option>

        {options.map((opt) => (
          <option key={opt.codigo} value={opt.codigo}>
            {opt.descripcion}
          </option>
        ))}
      </select>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
