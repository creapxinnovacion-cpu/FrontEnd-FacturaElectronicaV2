export default function Input({ error, ...props }) {
  return (
    <div className="space-y-1">
      <input
        {...props}
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
