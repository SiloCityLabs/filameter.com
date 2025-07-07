// --- PouchDB ---
import PouchDB from 'pouchdb';
// --- Helpers ---
import { isPouchDBError } from '@/helpers/isPouchDBError';

/**
 * Imports an array of documents into a PouchDB database, handling conflicts.
 *
 * This function iterates through a list of documents and attempts to 'put' each one
 * into the specified database. If a document with the same '_id' already exists,
 * PouchDB will throw a 'conflict' error. The function catches this specific error,
 * retrieves the latest revision ('_rev') of the existing document, and then
 * retries the 'put' operation with the updated revision, effectively overwriting the
 * existing document with the new one.
 *
 * @param {PouchDB.Database} db - The PouchDB database instance to import into.
 * @param data - An object containing arrays of documents.
 * @param {PouchDB.Core.Document<unknown>[]} data.regular - An array of standard documents to import.
 * @param {PouchDB.Core.Document<unknown>[]} data.local - An array of local (non-replicating) documents to import.
 * @throws {Error} Throws an error if any document fails to import for a reason other than a resolvable conflict.
 */
export async function importDB(
  db: PouchDB.Database,
  data: { regular: PouchDB.Core.Document<unknown>[]; local: PouchDB.Core.Document<unknown>[] }
) {
  try {
    const regularDocs = data.regular || [];
    const localDocs = data.local || [];
    const allDocs = [...regularDocs, ...localDocs];

    for (const doc of allDocs) {
      try {
        await db.put(doc);
      } catch (err: unknown) {
        if (isPouchDBError(err) && err.name === 'conflict') {
          try {
            // Conflict detected, fetch the existing document to get its _rev
            const existingDoc = await db.get(doc._id);
            // Attempt to update the document with the correct _rev
            await db.put({ ...doc, _rev: existingDoc._rev });
          } catch (innerErr: unknown) {
            console.error(`Error updating document after conflict ${doc._id}:`, innerErr);
            const message = innerErr instanceof Error ? innerErr.message : String(innerErr);
            throw new Error(`Failed to update document ${doc._id}: ${message}`);
          }
        } else {
          // Re-throw errors that are not conflict-related
          const message = err instanceof Error ? err.message : String(err);
          console.error(`Error importing document ${doc._id}:`, message);
          throw new Error(`Failed to import document ${doc._id}: ${message}`);
        }
      }
    }
  } catch (error) {
    console.error('Failed to import into database:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}
