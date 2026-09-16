export default function Input({ label, error, ...props }) {
  const inputProps = { ...props };
  if (inputProps.type !== 'file') {
    inputProps.value = inputProps.value ?? '';
  }

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-semibold text-gray-700 ml-1">
          {label}
        </label>
      )}
      <input
        {...inputProps}
        className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2
        ${
          error
            ? "border-red-500 focus:ring-red-400"
            : "border-gray-300 focus:ring-blue-500"
        }`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

