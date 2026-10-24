# 🇸🇻 SVFE Frontend - Aplicación Web y Punto de Venta (React 19 + Vite 7)

Aplicación web moderna, responsiva y de alto rendimiento para el **Sistema de Facturación Electrónica de El Salvador (SVFE V2.0 / V3.0)**, conforme a las normativas técnicas oficiales del Ministerio de Hacienda (DGII). 

Incluye Punto de Venta (POS), emisión de DTEs nacionales y de exportación, gestión integral de Eventos Oficiales (Invalidación y Retorno) con representaciones gráficas interactivas, módulo de Compras con ingesta JSON de CCF, control de Inventario/Kardex y exportación dual de **Libros de IVA contables y Anexos F-07 oficiales de Hacienda**.

---

## 🚀 Módulos y Funcionalidades Principales

### 1. 🛒 Punto de Venta (POS) y Emisión de DTEs
* **Factura de Consumidor Final (DTE-01):** Precios con IVA incluido (desglose 1.13), soporte de identificación por DUI/NIT, cliente extranjero o ventas anónimas.
* **Comprobante de Crédito Fiscal (DTE-03):** Precios netos, cálculo automático de IVA 13% (Tributo 20), retenciones/percepciones normativas del 1%, validación estricta de NRC y NIT del receptor.
* **Factura de Sujeto Excluido (DTE-14):** Retención del 10% de Impuesto sobre la Renta según legislación salvadoreña.
* **Factura de Exportación (DTE-11):** Módulo dedicado para operaciones internacionales con selección de Incoterms (CAT-014), países destino (CAT-020), recintos fiscales (CAT-027), tipo de ítem de exportación y regímenes aduaneros.
* **Búsqueda Instantánea:** Autocompletado rápido de clientes, productos y cálculo matemático fiscal en tiempo real sin descuadre de centavos.

---

### 2. ↩️ Gestión de Eventos Oficiales de Hacienda

#### A. Eventos de Retorno (`/retornos`)
* **Devoluciones de Mercancía:** Flujo normativo para reversión parcial o total de Facturas de Consumidor Final (DTE-01).
* **Modal de Emisión (`ModalEmitirRetorno.jsx`):** Validación de datos del receptor, montos retornados y justificación del movimiento.
* **Representación Gráfica Imprimible (`ModalGraficaRetorno.jsx`):** Formato oficial de comprobante de retorno con sello de recepción MH, código de generación, desglose de ítems devueltos y botón de impresión / descarga directa.
* **Notificación al Cliente:** Disparo de correo electrónico oficial con el comprobante de retorno adjunto.

#### B. Eventos de Invalidación (Anulaciones)
* **Validación de Plazos Legales:** Consulta y verificación en tiempo real del límite legal para anular (según el tipo de documento y mes fiscal).
* **Representación Gráfica (`ModalGraficaInvalidacion.jsx`):** Visualización interactiva e imprimible del comprobante formal de anulación con QR oficial y sello de recepción de Hacienda.

---

### 3. 📥 Módulo de Compras F-07 (`/compras`)
* **Ingesta Drag & Drop de Archivos JSON:** Carga masiva de comprobantes de Crédito Fiscal (DTE-03) recibidos de proveedores.
* **Validación Aritmética y Fiscal:**
  * Control de sumas y consistencia de centavos en base a valores enteros.
  * Verificación del NIT receptor para asegurar que pertenezca a la empresa.
  * Detección y prevención automática de documentos duplicados.
* **Exportación en 2 Clics:**
  * **Anexo 3 de Compras (F-07):** Archivo CSV de 21 columnas exactas listo para cargar en la plataforma del Ministerio de Hacienda.
  * **Libro de Compras Contable:** Reporte de 13 columnas estructurado para auditoría interna y contabilidad general.

---

### 4. 📊 Libros de IVA y Anexos F-07 (`/libros-iva`)
Gestión y auditoría del cumplimiento tributario mensual del IVA:
* **Modelo de Descarga Dual:**
  * **Libros Contables Tradicionales:** Exportación en PDF (formato horizontal) y CSV con encabezados legibles para conciliación interna en Excel.
  * **Anexos Oficiales F-07 (Ministerio de Hacienda):**
    * **Anexo 1 (Contribuyentes):** CSV normativo de **20 columnas**, sin encabezados, DTE clase 4, sanitización de UUIDs y controles sin guiones, exclusión estricta de DUI vs NIT/NRC e identificación de anexo `1`.
    * **Anexo 2 (Consumidor Final):** CSV normativo de **23 columnas**, sin encabezados, consolidación obligatoria diaria (primer y último documento emitido en el día), ventas gravadas con IVA incluido e identificación de anexo `2`.
* **Historial de Cierres Mensuales:** Navegación por meses y años fiscales con métricas consolidadas y descargas inmediatas.

---

### 5. 📦 Inventario, Productos & Kardex (`/productos` y `/kardex`)
* Catálogo de productos y servicios con categorías personalizables, códigos de barra y precios base.
* Control estricto de existencias e historial de movimientos en Kardex valorizado bajo Costo Promedio Ponderado.

---

### 6. 📈 Tablero de Control Fiscal (`/dashboard`)
* KPIs fiscales en tiempo real: Ventas gravadas del período, débito fiscal IVA acumulado, total facturado y documentos anulados/retornados.
* Métricas comparativas de rendimiento mensual.

---

## 🛠 Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework Base** | React 19.x + Vite 7.x | Interfaz SPA ultra rápida y modular |
| **Estilos y UI** | Tailwind CSS 4.x | Sistema de diseño moderno, limpio y responsivo |
| **Iconografía** | Lucide React + Heroicons | Iconos SVG optimizados y accesibles |
| **Enrutamiento** | React Router DOM v7 | Navegación protegida y modular |
| **Visualización** | Recharts | Gráficos estadísticos y tendencias de ventas |
| **Cliente HTTP** | Axios | Comunicación con el backend Laravel y manejo de tokens |
| **Manejo de Fechas** | Day.js | Procesamiento normativo de fechas ISO salvadoreñas |
| **Almacenamiento Local** | Dexie.js (IndexedDB) | Respaldo y caché local offline-first |

---

## 💻 Instalación y Configuración Local

### 1. Clonar el repositorio y entrar a la carpeta:
```bash
cd frontend
```

### 2. Instalar dependencias:
```bash
npm install
```

### 3. Configurar variables de entorno:
Crear o verificar el archivo `.env`:
```ini
VITE_API_URL=http://localhost:8000/api
```

### 4. Iniciar en modo desarrollo:
```bash
npm run dev
```
La aplicación se levantará en [http://localhost:3000](http://localhost:3000) (o el puerto configurado por Vite).

### 5. Compilar para producción:
```bash
npm run build
```
Los archivos optimizados y minificados quedarán en la carpeta `dist/`.

---

## 📂 Estructura del Proyecto

```text
frontend/
├── public/                  # Recursos estáticos y logos
├── src/
│   ├── assets/              # Archivos CSS y multimedia
│   ├── components/          # Componentes reutilizables
│   │   ├── DteForm.jsx              # Formulario modular de emisión de DTE
│   │   ├── ModalEmitirRetorno.jsx   # Emisión de eventos de retorno
│   │   ├── ModalGraficaRetorno.jsx  # Representación gráfica del comprobante de retorno
│   │   ├── ModalGraficaInvalidacion.jsx # Comprobante de anulación con QR
│   │   ├── Navbar.jsx               # Navegación principal
│   │   └── ...
│   ├── pages/               # Vistas principales de la aplicación
│   │   ├── Dashboard.jsx            # Resumen fiscal y KPIs
│   │   ├── DteEmitidos.jsx          # Listado y trazabilidad de DTEs
│   │   ├── FacturaExportacion.jsx   # Emisión de DTE-11 Exportación
│   │   ├── LibrosIva.jsx            # Libros y Anexos F-07 (Ventas)
│   │   ├── compras.jsx              # Ingesta JSON y Anexo 3 F-07
│   │   ├── Retornos.jsx             # Gestión de Eventos de Retorno
│   │   ├── Anulaciones.jsx          # Gestión de Eventos de Invalidación
│   │   └── ...
│   ├── services/            # Servicios de conexión API (Axios)
│   │   └── api/
│   │       ├── dte.service.js
│   │       ├── evento.service.js    # Invalidaciones, retornos y contingencias
│   │       └── ...
│   ├── utils/               # Catálogos oficiales MH y formateadores
│   │   └── catalogos/       # CatIncoterms, CatPais, CatTipoDte, etc.
│   ├── App.jsx              # Definición de rutas principales
│   └── main.jsx             # Punto de entrada de React
├── package.json
└── vite.config.js
```
