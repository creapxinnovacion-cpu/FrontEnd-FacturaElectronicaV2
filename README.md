# 🇸🇻 SVFE Frontend - Aplicación Web y Punto de Venta (React 19 + Vite 7)

Aplicación web moderna, responsiva y de grado empresarial para el **Sistema de Facturación Electrónica de El Salvador (SVFE V2.0 / V3.0)**, desarrollada en estricto cumplimiento con la normativa tecnológica oficial del Ministerio de Hacienda (Dirección General de Impuestos Internos - DGII).

El sistema integra Punto de Venta (POS), emisión de todos los Documentos Tributarios Electrónicos (DTEs) nacionales y de exportación, gestión completa de los tres Eventos Oficiales de Hacienda (Invalidación, Retorno y Contingencia), despacho automatizado y manual de correos electrónicos vía Gmail/SMTP con adjuntos oficiales, módulo de compras con ingesta JSON de CCF, control de inventario y Kardex, sincronización offline-first y descarga de **Libros de IVA contables y Anexos F-07 oficiales**.

---

## 📑 1. Catálogo Completo de Documentos Tributarios (DTEs) Emitidos

La aplicación cuenta con interfaces y formularios especializados para cada tipo de documento tributario regulado por el Ministerio de Hacienda:

| DTE | Nombre Oficial | Ruta en Frontend | Características Fiscales y Funcionales |
| :---: | :--- | :--- | :--- |
| **01** | **Factura de Consumidor Final** | `/factura-consumidor`, `/venta` | • Precios de venta con IVA incluido.<br>• Desglose aritmético automático con divisor normativo `1.13`.<br>• Venta a cliente final anónimo o identificado mediante DUI, NIT o pasaporte.<br>• Soporte de ítems gravados, exentos y no sujetos. |
| **03** | **Comprobante de Crédito Fiscal (CCF)** | `/credito-fiscal` | • Precios netos sin IVA.<br>• Cálculo automático del 13% de IVA Débito Fiscal (Tributo código 20).<br>• Retención y percepción del 1% del IVA (Grandes Contribuyentes / Agentes de Retención).<br>• Validación estricta y obligatoria de NRC (Registro de Contribuyente) y NIT del receptor. |
| **05** | **Nota de Crédito** | `/nota-credito` | • Devoluciones, rebajas, bonificaciones o rescisiones sobre operaciones previas.<br>• Vinculación obligatoria al documento tributario de origen mediante su **Código de Generación (UUID)**.<br>• Ajuste y disminución proporcional del Débito Fiscal IVA. |
| **06** | **Nota de Débito** | `/nota-debito` | • Cargos adicionales, intereses moratorios o gastos financieros posteriores a la venta.<br>• Vinculación estricta con el DTE previo.<br>• Incremento del Débito Fiscal IVA correspondiente. |
| **11** | **Factura de Exportación** | `/factura-exportacion`, `/exportacion` | • Operaciones comerciales internacionales exentas de IVA local salvadoreño.<br>• Selección de **Incoterms oficiales (CAT-014)**: FOB, CIF, EXW, CFR, etc.<br>• Catálogo de **Países de Destino (CAT-020)** y divisas.<br>• Selección de **Recintos Fiscales y Aduanas (CAT-027)** y **Regímenes de Exportación (CAT-026)**.<br>• Identificación de clientes no domiciliados mediante Pasaporte o Tax ID extranjero. |
| **14** | **Factura de Sujeto Excluido** | `/sujeto-excluido` | • Emisión a personas naturales sin registro de IVA por prestación de servicios o venta de bienes.<br>• Retención automática del 10% de Impuesto sobre la Renta (nodo `sujetoExcluido`).<br>• Sin aplicación de IVA. |

---

## ⚡ 2. Gestión de Eventos Tributarios Oficiales de Hacienda

El frontend proporciona módulos completos para la gestión y trazabilidad de los tres eventos normativos exigidos por el Ministerio de Hacienda:

### A. ↩️ Evento de Retorno de Mercancía (`/retornos`)
* **Propósito:** Registrar devoluciones totales o parciales de productos vendidos mediante **Facturas de Consumidor Final (DTE-01)** sin necesidad de anular el documento completo.
* **Modal de Emisión (`ModalEmitirRetorno.jsx`):**
  * Búsqueda ágil del DTE-01 de origen.
  * Selección interactiva de los ítems a devolver con validación de cantidades máximas permitidas.
  * Cálculo dinámico de montos a retornar y reintegro del IVA.
  * Ingreso de justificación normativa del retorno.
* **Reingreso Automatizado a Inventario:** Afectación inmediata en el Kardex del producto (`ENTRADA_DEV_VENTA`) con actualización del stock y costo promedio.
* **Representación Gráfica Imprimible (`ModalGraficaRetorno.jsx`):** Comprobante visual oficial con diseño listo para imprimir o guardar en PDF, mostrando sello de recepción MH, código de generación del evento y desglose de mercadería.
* **Envío al Cliente:** Botón integrado para despachar el comprobante de retorno directamente al correo del comprador.

---

### B. 🚫 Evento de Invalidación / Anulación Oficial (`/anulaciones`)
* **Propósito:** Anulación formal ante Hacienda de documentos emitidos con errores de facturación o rescisiones comerciales.
* **Validación de Plazos Legales en Tiempo Real:**
  * Para Facturas de Consumidor Final (01): Hasta el décimo (10º) día hábil del mes siguiente a la emisión.
  * Para Crédito Fiscal (03) y otros: Hasta tres (3) meses posteriores a la fecha de emisión.
  * El sistema consulta automáticamente con el backend (`/api/eventos/invalidacion/plazo/{id}`) e impide intentos fuera del marco legal.
* **Catálogo de Motivos de Invalidación (CAT-024):** Rescisión de la operación, error en datos del receptor, error en ítems o precios.
* **Representación Gráfica con Código QR (`ModalGraficaInvalidacion.jsx`):**
  * Comprobante oficial de anulación con el código QR normativo de Hacienda, sello de recepción del evento, datos del responsable de la invalidación y del receptor.
  * Descarga e impresión directa.

---

### C. 🛡️ Evento de Contingencia y Transmisión Diferida (`/estados-emision`)
* **Propósito:** Garantizar la continuidad operativa de la facturación comercial ante fallos de conexión a Internet, indisponibilidad del servicio de firma o caídas de los servidores del Ministerio de Hacienda.
* **Monitor de Salud y Diagnóstico en Vivo:**
  * Indicadores de estado y latencia de la API de Recepción de Hacienda (MH).
  * Estado del microservicio de firma digital Java JWS Compact (RS512).
  * Estado y conectividad de la Base de Datos local.
* **Modo de Contingencia Local:**
  * Los documentos emitidos durante la contingencia se firman y resguardan localmente en estado `CONTINGENCIA`.
  * La venta no se detiene ni se pierde.
* **Transmisión por Lotes y Acreditación de Pruebas:**
  * Botón para transmitir en lote los eventos de contingencia acumulados una vez restablecido el servicio.
  * Panel de ejecución para las **5 Pruebas de Acreditación de Contingencia** exigidas en la fase de certificación con Hacienda (contador visual 0/5 con reporte de resultados).
* **Sincronización Offline (IndexedDB + Dexie):**
  * Hook global `useOfflineSync` que monitorea el estado de la red y sincroniza las transacciones pendientes en segundo plano.

---

## 📧 3. Envío de Comprobantes por Correo Electrónico (Integración Gmail / SMTP)

El sistema cuenta con un motor completo de notificación electrónica al receptor:

* **Modal de Despacho Inmediato:**
  * Al finalizar la emisión de cualquier DTE en el POS, se ofrece el envío automático o manual al correo electrónico del cliente.
  * Disponible también desde el listado general de **DTEs Emitidos (`/dte-emitidos`)** y en el visor de **Eventos de Retorno (`/retornos`)**.
* **Contenido del Correo:**
  * Plantilla HTML corporativa y profesional con los datos de la compra.
  * **PDF Oficial Adjunto:** Representación gráfica completa con diseño fiscal, logotipos y código QR de validación en Hacienda.
  * **JSON Firmado Adjunto:** Archivo `.json` firmado criptográficamente con el sello de recepción oficial devuelto por el Ministerio de Hacienda (respaldo tributario legal para el contribuyente receptor).
* **Configuración del Servidor SMTP de Gmail:**
  El backend orquesta el despacho a través de la infraestructura segura de Google:
  ```ini
  MAIL_MAILER=smtp
  MAIL_HOST=smtp.gmail.com
  MAIL_PORT=587
  MAIL_ENCRYPTION=tls
  MAIL_USERNAME=tu_correo@gmail.com
  MAIL_PASSWORD=tu_contraseña_de_aplicacion_google# Contraseña de aplicación de 16 caracteres
  MAIL_FROM_ADDRESS=tu_correo@gmail.com
  MAIL_FROM_NAME="Nombre de tu Empresa / Emisor"
  ```
* **Edición Dinámica:** Permite escribir o corregir el correo del receptor en el momento del envío sin alterar los datos maestros del cliente.

---

## 📥 4. Módulo de Compras F-07 (`/compras`)

* **Ingesta Masiva Drag & Drop:** Carga interactiva de múltiples archivos JSON de Comprobantes de Crédito Fiscal (DTE-03) recibidos de proveedores.
* **Validación Contable y Aritmética:**
  * Verificación de consistencia de sumas y redondeos a nivel de centavos enteros.
  * Comprobación del NIT receptor para asegurar que el gasto pertenezca a la empresa.
  * Detección y descarte de documentos duplicados por código de generación.
* **Exportación Dual en 2 Clics:**
  * **Anexo 3 de Compras (F-07 Oficial):** Archivo CSV de **21 columnas** estructurado bajo los lineamientos de la DGII, listo para declarar en el portal del Ministerio de Hacienda.
  * **Libro de Compras Tradicional:** Reporte de 13 columnas en PDF y CSV para conciliación contable y financiera interna.

---

## 📊 5. Libros de IVA y Anexos F-07 de Ventas (`/libros-iva`)

* **Modelo Dual de Descarga:**
  * **Libros Contables Tradicionales:** Exportación horizontal en PDF para impresión fiscal y CSV con encabezados legibles para análisis en hojas de cálculo.
  * **Anexo 1 - Ventas a Contribuyentes (F-07 Oficial):** CSV de **20 columnas exactas** sin encabezados, DTE clase 4, sanitización de identificadores sin guiones, exclusión estricta de DUI vs NIT/NRC y código final `1`.
  * **Anexo 2 - Ventas a Consumidor Final (F-07 Oficial):** CSV de **23 columnas exactas**, sin encabezados, con **consolidación diaria obligatoria** (código del primer DTE en Columna H y código del último DTE en Columna I), ventas gravadas con IVA incluido y código final `2`.
* **Histórico Fiscal:** Filtro por mes y año para consultar y descargar declaraciones de períodos anteriores.

---

## 📦 6. Inventario, Productos & Kardex (`/stock`)

* Catálogo completo de productos y servicios con categorías, código de barras, precios y tarifas fiscales.
* Control de existencias valorizadas bajo el método de **Costo Promedio Ponderado**.
* Trazabilidad completa de movimientos: Entradas por compra, salidas por venta DTE y reingresos por Eventos de Retorno.

---

## ⚙️ 7. Configuración del Contribuyente Emisor (`/emisorConfig`)

* Gestión de datos fiscales del emisor: Nombre comercial, razón social, NIT, NRC, actividad económica y dirección.
* Configuración de sucursales (`cod_estable`) y puntos de venta (`cod_punto_venta`).
* Carga del certificado digital privado en formato **PKCS#12 (`.p12`)** y clave secreta de firma.
* Carga y personalización del **Logo Comercial** que se estampa automáticamente en las representaciones gráficas en PDF.

---

## 🛠 Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework Base** | React 19.x + Vite 7.x | Arquitectura modular, carga ultrarrápida y renderizado reactivo |
| **Diseño y Estilos** | Tailwind CSS 4.x | Sistema de diseño moderno, tipografías limpias y componentes responsivos |
| **Iconografía** | Lucide React + Heroicons | Iconos SVG ligeros y semánticos |
| **Enrutamiento** | React Router DOM v7 | Ruteo SPA con protección de rutas |
| **Gráficos y Métricas**| Recharts | Métricas de ventas y comparativas de rendimiento |
| **Cliente HTTP** | Axios | Peticiones asíncronas con interceptores de autenticación |
| **Procesamiento Fechas**| Day.js | Manipulación de fechas ISO normativas salvadoreñas |
| **Caché y Offline** | Dexie.js (IndexedDB) | Persistencia local y buffer de contingencia offline-first |

---

## 💻 Instalación y Ejecución Local

### 1. Clonar el proyecto y acceder a la carpeta:
```bash
cd frontend
```

### 2. Instalar dependencias:
```bash
npm install
```

### 3. Configurar variables de entorno (`.env`):
```ini
VITE_API_URL=http://localhost:8000/api
```

### 4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```
La aplicación iniciará en `http://localhost:3000` (o el puerto configurado por Vite).

### 5. Compilar para producción:
```bash
npm run build
```
Genera la versión optimizada en la carpeta `dist/`.

---

## 📂 Mapa de Rutas y Componentes Clave

```text
frontend/src/
├── App.jsx                        # Ruteo principal y sincronización offline global
├── main.jsx                       # Montaje de React 19
├── components/
│   ├── DteForm.jsx                # Formulario modular de emisión de DTEs
│   ├── ModalItemDte.jsx           # Detalle y cálculo de ítems tributarios
│   ├── ModalEmitirRetorno.jsx     # Emisión de Eventos de Retorno
│   ├── ModalGraficaRetorno.jsx    # Representación Gráfica del Comprobante de Retorno
│   ├── ModalGraficaInvalidacion.jsx # Representación Gráfica de Anulación con QR oficial
│   ├── Navbar.jsx                 # Barra de navegación principal
│   └── EstadoConexion.jsx         # Indicador de estado de red
├── pages/
│   ├── Home.jsx                   # Dashboard interactivo con KPIs fiscales
│   ├── FacturaConsumidor.jsx      # Emisión DTE-01 (Factura Consumidor Final)
│   ├── CreditoFiscal.jsx          # Emisión DTE-03 (Comprobante de Crédito Fiscal)
│   ├── NotaCredito.jsx            # Emisión DTE-05 (Nota de Crédito)
│   ├── NotaDebito.jsx             # Emisión DTE-06 (Nota de Débito)
│   ├── FacturaExportacion.jsx     # Emisión DTE-11 (Factura de Exportación)
│   ├── FacturaSujetoExcluido.jsx  # Emisión DTE-14 (Factura de Sujeto Excluido)
│   ├── Retornos.jsx               # Gestión y visualización de Eventos de Retorno
│   ├── Anulaciones.jsx            # Gestión y validación de Eventos de Invalidación
│   ├── EstadosEmision.jsx         # Diagnóstico MH, contingencias y pruebas 0/5
│   ├── DteEmitidos.jsx            # Listado de documentos, reenvío de correo y descarga
│   ├── compras.jsx                # Ingesta masiva JSON de CCF y Anexo 3 F-07
│   ├── LibrosIva.jsx              # Descarga de Libros y Anexos 1 y 2 F-07
│   ├── Stock.jsx                  # Gestión de Inventario y Kardex
│   └── EmisorConfig.jsx           # Configuración de Emisor, certificado .p12 y logo
├── hooks/
│   └── useOfflineSync.js          # Sincronización en segundo plano de contingencias
└── services/api/
    ├── dte.service.js             # API de emisión, PDF, JSON y reenvío de correo
    ├── evento.service.js          # API de retornos, invalidaciones y contingencia
    └── batch.service.js           # API de compras y procesamiento masivo
```
