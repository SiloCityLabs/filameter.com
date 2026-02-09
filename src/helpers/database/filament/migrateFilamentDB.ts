import PouchDB from 'pouchdb';
import Joi from 'joi';
import { isPouchDBError } from '@/helpers/isPouchDBError';
// --- Types ---
import { InfoSchema } from '@/types/PouchDB';

const CURRENT_DB_VERSION = 2;

async function getInfo(db: PouchDB.Database): Promise<InfoSchema> {
  try {
    const infoDoc = await db.get<InfoSchema>('_local/info');
    return infoDoc;
  } catch (err) {
    if (isPouchDBError(err) && err.name === 'not_found') {
      // Return a default InfoSchema object if not found.
      return { version: 0, updated: Date.now(), synchash: '', plan: '', revision: 0 };
    } else {
      throw err;
    }
  }
}

async function updateInfo(db: PouchDB.Database, updates: InfoSchema): Promise<void> {
  try {
    let infoDoc;
    try {
      infoDoc = await db.get<InfoSchema>('_local/info');
      // Correctly update existing document, preserving _id and _rev
      const newInfoDoc = {
        ...updates,
        _id: infoDoc._id,
        _rev: infoDoc._rev,
      } as PouchDB.Core.PutDocument<InfoSchema>;
      await db.put(newInfoDoc);
    } catch (err) {
      if (isPouchDBError(err) && err.name === 'not_found') {
        // Create a new document if it doesn't exist
        const newInfoDoc: PouchDB.Core.Document<InfoSchema> = { _id: '_local/info', ...updates };
        await db.put(newInfoDoc);
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error('Error updating info:', error);
    throw new Error(
      'Failed to update database information: ' +
        (error instanceof Error ? error.message : String(error))
    );
  }
}

// --- Migration Function ---
export async function migrateFilamentDB(db: PouchDB.Database) {
  try {
    const info = await getInfo(db);
    const currentVersion = info.version;

    // --- Version 1 Migration (Historical) ---
    if (currentVersion < 1) {
      console.log('Migrating database to version 1...');
      console.log('Migration to version 1 complete.');
    }

    // --- Version 2 Migration (Usage History) ---
    if (currentVersion < 2) {
      console.log('Migrating database to version 2 (Adding usage_history)...');

      const allDocs = await db.allDocs({ include_docs: true });

      // Filter for docs that need the usage_history field or default weights
      const updates = allDocs.rows
        .filter((row) => {
          if (row.id.startsWith('_design/')) return false; // Skip design docs
          const doc = row.doc as any;
          return (
            !doc.total_weight ||
            typeof doc.used_weight === 'undefined' ||
            !Array.isArray(doc.usage_history)
          );
        })
        .map((row) => {
          const doc = row.doc as any;
          return {
            ...doc,
            total_weight: doc.total_weight || 1000,
            used_weight: doc.used_weight || 0,
            usage_history: Array.isArray(doc.usage_history) ? doc.usage_history : [],
          };
        });

      if (updates.length > 0) {
        console.log(`Migrating ${updates.length} filament documents to v2 schema...`);
        await db.bulkDocs(updates);
      }

      console.log('Migration to version 2 complete.');
    }

    // Update db version (only if migrations were successful)
    if (currentVersion < CURRENT_DB_VERSION) {
      await updateInfo(db, { ...info, version: CURRENT_DB_VERSION, updated: Date.now() });
    }
  } catch (error) {
    console.error('Database migration error:', error);
    throw error;
  }
}

// --- Joi Schema ---
export const filamentSchema = Joi.object({
  _id: Joi.string().allow(''),
  _rev: Joi.string().allow(''),
  filament: Joi.string().required(),
  material: Joi.string().required(),
  used_weight: Joi.number().min(0).empty('').default(0),
  total_weight: Joi.number().min(0).empty('').default(1000),
  location: Joi.string().empty('').default(''),
  comments: Joi.string().allow('').default(''),
  color: Joi.string().allow('').default(''),
  price: Joi.number().min(0).empty('').default(0),
  brand: Joi.string().allow('').default(''),
  // New field validation for v2
  usage_history: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        date: Joi.string().required(),
        weight: Joi.number().required(),
        printName: Joi.string().allow('').optional(),
        status: Joi.string().valid('success', 'failure').required(),
        notes: Joi.string().allow('').optional(),
      })
    )
    .default([]),
});
