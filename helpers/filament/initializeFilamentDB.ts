import PouchDB from "pouchdb";
import Joi from "joi";
import { isPouchDBError } from "@/helpers/isPouchDBError";
//Types
import { InfoSchema } from "@/types/PouchDB";

const CURRENT_DB_VERSION = 1;

async function getInfo(db: PouchDB.Database): Promise<InfoSchema> {
  try {
    const infoDoc = await db.get<InfoSchema>("_local/info");
    return infoDoc;
  } catch (err) {
    if (isPouchDBError(err) && err.name === "not_found") {
      // Return a default InfoSchema object if not found.
      return {
        version: 0,
        updated: Date.now(),
        synchash: "",
        plan: "",
        revision: 0,
      };
    } else {
      throw err;
    }
  }
}

async function updateInfo(
  db: PouchDB.Database,
  updates: Partial<InfoSchema>
): Promise<void> {
  try {
    let infoDoc;
    try {
      infoDoc = await db.get<InfoSchema>("_local/info");
      // Correctly update existing document, preserving _id and _rev
      const newInfoDoc: PouchDB.Core.Document<InfoSchema> = {
        ...updates,
        _id: infoDoc._id,
        _rev: infoDoc._rev,
      };
      await db.put(newInfoDoc);
    } catch (err) {
      if (isPouchDBError(err) && err.name === "not_found") {
        // Create a new document if it doesn't exist
        const newInfoDoc: PouchDB.Core.Document<InfoSchema> = {
          _id: "_local/info",
          ...updates,
        };
        await db.put(newInfoDoc);
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error("Error updating info:", error);
    throw new Error(
      "Failed to update database information: " +
        (error instanceof Error ? error.message : String(error))
    );
  }
}

// --- Migration Function ---
async function migrateDatabase(db: PouchDB.Database) {
  try {
    const info = await getInfo(db);
    const currentVersion = info.version;

    // Migrations (Example)
    if (currentVersion < 1) {
      console.log("Migrating database to version 1...");
      // ... your migration logic for version 1 ...  (e.g., creating indexes)
      console.log("Migration to version 1 complete.");
    }

    // Update db version (only if migrations were successful)
    if (currentVersion < CURRENT_DB_VERSION) {
      await updateInfo(db, {
        version: CURRENT_DB_VERSION,
        updated: Date.now(),
      });
    }
  } catch (error) {
    console.error("Database migration error:", error);
    throw error;
  }
}

// --- Initialization Function ---
export async function initializeFilamentDB(): Promise<PouchDB.Database | null> {
  if (typeof window !== "undefined") {
    const db = new PouchDB("filament", { adapter: "idb" });

    try {
      await migrateDatabase(db);
      return db;
    } catch (error) {
      console.error("Failed to initialize and migrate database:", error);
      return null;
    }
  } else {
    console.warn(
      "Database initialization should only happen on the client-side."
    );
    return null;
  }
}

// --- Joi Schema ---
export const filamentSchema = Joi.object({
  _id: Joi.string().allow(""),
  _rev: Joi.string().allow(""),
  filament: Joi.string().required(),
  material: Joi.string().required(),
  used_weight: Joi.number().min(0).empty("").default(0),
  total_weight: Joi.number().min(0).empty("").default(1000),
  location: Joi.string().empty("").default(""),
  comments: Joi.string().allow(""),
});
