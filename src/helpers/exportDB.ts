import PouchDB from 'pouchdb';
import { isPouchDBError } from '@/helpers/isPouchDBError';
import type { ExportedData } from '@/types/api';

/**
 * Exports all documents from a PouchDB database.
 *
 * This function fetches all regular and known local documents from the specified
 * database. It strips the '_rev' field from each document to prevent conflicts
 * upon re-import. The function can either return the data as an object or
 * trigger a file download in the browser.
 *
 * @param {PouchDB.Database} db - The PouchDB database instance to export from.
 * @param {boolean} [returnFile=true] - If true, triggers a file download. If false, returns the data as an object.
 * @returns {Promise<void | ExportedData>} Returns a promise that resolves to nothing (if downloading a file)
 * or to an object containing the exported data.
 * @throws {Error} Throws an error if the database export fails.
 */
export async function exportDB(
  db: PouchDB.Database,
  returnFile = true
): Promise<void | ExportedData> {
  try {
    // Fetch all regular documents, excluding design documents
    const result = await db.allDocs({ include_docs: true });
    const docs = result.rows
      .filter((row) => row.doc && !row.id.startsWith('_design/'))
      .map((row) => {
        // Create a copy and remove the _rev property
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _rev, ...docWithoutRev } = row.doc;
        return docWithoutRev;
      });

    // Fetch known local documents
    const localDocs: PouchDB.Core.Document<unknown>[] = [];
    const knownLocalIds = ['_local/info']; // Add other known local doc IDs here

    for (const docId of knownLocalIds) {
      try {
        const doc = await db.get(docId);
        // Create a copy and remove the _rev property
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _rev, ...docWithoutRev } = doc;
        localDocs.push(docWithoutRev);
      } catch (err) {
        // Ignore 'not_found' errors, but throw others
        if (isPouchDBError(err) && err.name !== 'not_found') {
          throw err;
        }
      }
    }

    const exportData: ExportedData = { regular: docs, local: localDocs };

    // Return the data object if not downloading a file
    if (!returnFile) {
      return exportData;
    }

    // Create a Blob from the data and trigger a download
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filameter-db-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export database:', error);
    throw error;
  }
}
