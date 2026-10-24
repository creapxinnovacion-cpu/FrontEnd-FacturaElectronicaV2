# SVFE Frontend - Aplicación Web y Punto de Venta (React + Vite)

Aplicación web moderna y responsiva para la gestión de Facturación Electrónica (SVFE V2.0 / V3.0) en El Salvador. Proporciona Punto de Venta (POS), emisión de DTEs, gestión de clientes, control de inventario y Kardex, módulo de compras y descarga de Libros de IVA contables y **Anexos oficiales del F-07 para el Ministerio de Hacienda**.

---

## 🚀 Módulos y Funcionalidades

### 1. Libros de IVA y Anexos F-07 (`/libros-iva`)
Gestión centralizada del cumplimiento tributario del IVA:
* **Modelo de Descarga Dual:**
  * **Libros Contables Tradicionales:** Descarga en PDF (diseño horizontal listo para impresión) y CSV con encabezados legibles para conciliación y análisis financiero en Excel.
  * **Anexos Oficiales F-07 (Ministerio de Hacienda):**
    * **Anexo 1 (Contribuyentes):** CSV de 20 columnas exactas sin encabezados, DTE clase 4, sanitización sin guiones en UUID y controles, exclusión estricta de DUI vs NIT/NRC y columna final con número de anexo `1`.
    * **Anexo 2 (Consumidor Final):** CSV de 23 columnas exactas sin encabezados, consolidación obligatoria por día (código primer DTE en Col H, código último DTE en Col I), ventas gravadas con IVA incluido y columna final con número de anexo `2`.
* **Historial de Cierres Mensuales:** Consulta de períodos anteriores con descargas rápidas tanto en PDF como en Anexo F-07.

### 2. Módulo de Compras F-07 (`/compras`)
* **Ingesta Inteligente:** Carga por arrastrar y soltar (Drag & Drop) de archivos JSON de Comprobantes de Crédito Fiscal (DTE tipo 03) emitidos por proveedores.
* **Validación Contable Aritmética:** Verificación de sumas, cálculo de centavos enteros, validación de NIT receptor y detección de documentos duplicados.
* **Exportación Normativa:**
  * Libro de Compras contable (13 columnas).
  * Anexo 3 de Compras para el F-07 (21 columnas según catálogo DGII).

### 3. Punto de Venta (POS) y Facturación
* Emisión rápida de Factura de Consumidor Final (DTE 01) y Crédito Fiscal (DTE 03).
* Desglose automático de IVA (1.13 en facturas y 13% en créditos fiscales).
* Soporte para retención y percepción del 1% y retención de Renta del 10% en Sujeto Excluido (DTE 14).
* Búsqueda instantánea y autocompletado de clientes con NRC y NIT.

### 4. Control de Inventario & Kardex (`/productos` y `/kardex`)
* Catálogo de productos con categorías, precios y control de existencias.
* Registro de movimientos de inventario y visualización del costo promedio ponderado.

### 5. Tablero de Control Fiscal (`/dashboard`)
* Resumen en tiempo real del mes en curso: ventas gravadas, IVA débito fiscal generado, total recaudado y documentos cancelados.

---

## 🛠 Stack Tecnológico

* **Framework:** React 19 + Vite 7
* **Estilos:** Tailwind CSS 4
* **Iconografía:** Heroicons (`@heroicons/react`)
* **Ruteo:** React Router DOM
* **Librerías de Utilidad:** Recharts (gráficos), jsPDF (generación de comprobantes)

---

## 💻 Instalación y Ejecución Local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configuración de Variables de Entorno
Crea o edita el archivo `.env`:
```ini
VITE_API_URL=http://localhost:8000/api
```

### 3. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000) (o el puerto asignado por Vite).

### 4. Compilar para Producción
```bash
npm run build
```
Los archivos optimizados se generarán en la carpeta `dist/`.
