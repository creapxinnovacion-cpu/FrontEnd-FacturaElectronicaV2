import { useEffect, useRef } from 'react';
import { db } from '../services/db';
import { batchService } from '../services/api/batch.service';

export function useOfflineSync() {
  const isSyncing = useRef(false);

  useEffect(() => {
    const syncOfflineDocs = async () => {
      // Evitar que dos sincronizaciones ocurran al mismo tiempo
      if (isSyncing.current) return;
      if (!navigator.onLine) return; // No hay internet a nivel de navegador

      isSyncing.current = true;

      try {
        const pendingDocs = await db.offlineDocs.toArray();

        for (const doc of pendingDocs) {
          try {
            // Enviamos el payload original limpio
            await batchService.create(doc.payloadOriginal);
            
            // Si funciona, lo eliminamos de la cola
            await db.offlineDocs.delete(doc.id);
            console.log(`✅ Documento offline sincronizado con éxito: ${doc.id}`);
            
          } catch (error) {
            console.error(`❌ Error sincronizando doc ${doc.id}:`, error);
            
            // Incrementamos los retries para el backoff
            await db.offlineDocs.update(doc.id, {
              retries: (doc.retries || 0) + 1
            });
          }
        }
      } catch (err) {
        console.error("Error al procesar la cola de sincronización", err);
      } finally {
        isSyncing.current = false;
      }
    };

    // 1. Intentar sincronizar apenas la aplicación carga (si hay internet)
    syncOfflineDocs();

    // 2. Escuchar cuando el navegador detecta que volvió la red
    window.addEventListener('online', syncOfflineDocs);

    // 3. (Opcional) Un temporizador cada X minutos para reintentar (Retry Exponencial Simplificado)
    // Se ejecuta cada 2 minutos en caso de que el evento 'online' falle.
    const interval = setInterval(syncOfflineDocs, 120000);

    return () => {
      window.removeEventListener('online', syncOfflineDocs);
      clearInterval(interval);
    };
  }, []);
}
