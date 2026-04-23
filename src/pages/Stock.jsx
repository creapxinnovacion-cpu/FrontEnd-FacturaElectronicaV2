import { CubeIcon, MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";

export default function Stock() {
  const productos = [
    { id: 1, nombre: "Laptop Pro 14", sku: "LP-001", stock: 15, precio: 1200.00, categoria: "Electrónica" },
    { id: 2, nombre: "Monitor 27 UHD", sku: "MON-27", stock: 8, precio: 350.00, categoria: "Electrónica" },
    { id: 3, nombre: "Teclado Mecánico", sku: "KBD-MEC", stock: 0, precio: 85.00, categoria: "Accesorios" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Inventario / Stock</h1>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition">
          NUEVO PRODUCTO
        </button>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          <input type="text" placeholder="Buscar por nombre o SKU..." className="w-full bg-white border rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <button className="px-4 py-2 bg-white border rounded-xl flex items-center text-sm font-medium text-gray-600 hover:bg-gray-50">
          <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" /> Filtros
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr className="text-xs text-gray-500 uppercase font-semibold">
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Precio</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {productos.map((prod) => (
              <tr key={prod.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mr-3">
                      <CubeIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{prod.nombre}</p>
                      <p className="text-xs text-gray-500">{prod.categoria}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{prod.sku}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${prod.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {prod.stock > 0 ? `${prod.stock} unidades` : 'Agotado'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-800">$ {prod.precio.toFixed(2)}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-bold">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
