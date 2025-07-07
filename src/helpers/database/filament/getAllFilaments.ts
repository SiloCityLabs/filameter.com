// --- PouchDB ---
import PouchDB from 'pouchdb';
// --- Types ---
import type { Filament } from '@/types/Filament';

/**
 * Defines the structure for a row from allDocs that includes the full document.
 * This uses a generic constraint to ensure T is an object type.
 */
interface RowWithExistingDoc<T extends object> {
  id: string;
  key: string;
  value: { rev: string };
  doc: PouchDB.Core.ExistingDocument<T>;
}

// Define the expected return type, which is the base Filament type plus a calculated weight.
type FilamentWithCalcWeight = Filament & { calc_weight: number };

/**
 * Retrieves all filament documents from the database and calculates remaining weight.
 *
 * This function fetches all documents, filters out PouchDB's design documents,
 * and then for each filament, it calculates the remaining weight (`calc_weight`)
 * by subtracting the `used_weight` from the `total_weight`.
 *
 * @param {PouchDB.Database} db - The PouchDB database instance for filaments.
 * @returns {Promise<FilamentWithCalcWeight[]>} A promise that resolves to an array of
 * filament objects, each including the calculated remaining weight.
 * @throws {Error} Throws an error if fetching from the database fails.
 */
async function getAllFilaments(db: PouchDB.Database): Promise<FilamentWithCalcWeight[]> {
  if (!db) {
    console.error('Database is not initialized.');
    return [];
  }

  try {
    // Fetch all documents, specifying the expected document type.
    const result = await db.allDocs<Filament>({ include_docs: true, attachments: false });

    // Filter out rows without docs (and design docs) and use a type guard to assert the correct row structure.
    const data = result.rows
      .filter(
        (row): row is RowWithExistingDoc<Filament> =>
          Boolean(row.doc) && !row.id.startsWith('_design/')
      )
      .map((row) => {
        // Thanks to the type guard, row.doc is known to be a full document.
        const doc = row.doc;

        const totalWeight = typeof doc.total_weight === 'number' ? doc.total_weight : 0;
        const usedWeight = typeof doc.used_weight === 'number' ? doc.used_weight : 0;

        // Return a new object with all original properties plus the calculated weight.
        return { ...doc, calc_weight: totalWeight - usedWeight };
      });

    return data;
  } catch (error: unknown) {
    console.error('Error getting all filaments:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to retrieve filaments: ${error.message}`);
    } else if (typeof error === 'string') {
      throw new Error(error);
    } else {
      throw new Error('An unknown error occurred while retrieving filaments.');
    }
  }
}

export default getAllFilaments;
