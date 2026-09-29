import Dexie from 'dexie';

export const db = new Dexie('FacturacionOfflineDB');

// Definimos el esquema de la base de datos
// 'id' es la clave primaria. 
// 'estado', 'fecha' y 'retries' son índices para hacer búsquedas rápidas.
db.version(1).stores({
  offlineDocs: 'id, estado, fecha, retries'
});
