import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Venta from "./pages/Venta";
import Navbar from "./components/Navbar";
import FacturaConsumidor from "./pages/FacturaConsumidor";
import CreditoFiscal from "./pages/CreditoFiscal";
import NotaCredito from "./pages/NotaCredito";
import NotaDebito from "./pages/NotaDebito";
import FacturaSujetoExcluido from "./pages/FacturaSujetoExcluido";
import Reportes from "./pages/Reportes";
import Stock from "./pages/Stock";
import LibrosIva from "./pages/LibrosIva";
import Anulaciones from "./pages/Anulaciones";
import EstadosEmision from "./pages/EstadosEmision";
import EmisorConfig from "./pages/EmisorConfig";
import DteEmitidos from "./pages/DteEmitidos";
import { useOfflineSync } from "./hooks/useOfflineSync";

export default function App() {
  // Inicializamos el worker de sincronización en segundo plano globalmente
  useOfflineSync();

  return (
    <>
      {/* NAVBAR GLOBAL */}
      <Navbar />

      {/* RUTAS */}
      <Routes>
        {/* HOME / DASHBOARD */}
        <Route path="/" element={<Home />} />
        <Route path="/venta" element={<Venta />} />
        <Route path="/ventas" element={<Venta />} />
        <Route path="/factura-consumidor" element={<FacturaConsumidor />} />
        <Route path="/credito-fiscal" element={<CreditoFiscal />} />
        <Route path="/nota-credito" element={<NotaCredito />} />
        <Route path="/nota-debito" element={<NotaDebito />} />
        <Route path="/sujeto-excluido" element={<FacturaSujetoExcluido />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/libros-iva" element={<LibrosIva />} />
        <Route path="/anulaciones" element={<Anulaciones />} />
        <Route path="/estados-emision" element={<EstadosEmision />} />
        <Route path="/dte-emitidos" element={<DteEmitidos />} />
        <Route path="/emisorConfig" element={<EmisorConfig />} />
        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="p-8 text-center">
              <h1 className="text-4xl font-bold text-gray-800">404</h1>
              <p className="text-gray-500 mt-2">Página no encontrada</p>
            </div>
          }
        />
      </Routes>
    </>
  );
}
