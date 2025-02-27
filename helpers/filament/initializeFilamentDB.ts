import PouchDB from "pouchdb";
import Joi from "joi";
//Types
import { PouchDBError, InfoSchema } from "@/types/PouchDB";

const CURRENT_DB_VERSION = 1;

// --- Helper Functions ---
function isPouchDBError(err: unknown): err is PouchDBError {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    "name" in err &&
    "message" in err
  );
}

export async function testLocalDocs(db: PouchDB.Database) {
  try {
    const localDocs = await db.allDocs({
      include_docs: true,
      startkey: "_local/",
      endkey: "_local/\uffff",
    });
    console.log("testLocalDocs - Result:", localDocs);
    return localDocs; // Return the result for further inspection
  } catch (error) {
    console.error("testLocalDocs - Error:", error);
    return null; // Or throw the error
  }
}

async function getInfo(db: PouchDB.Database): Promise<InfoSchema> {
  try {
    const infoDoc = await db.get<InfoSchema>("_local/info");
    return infoDoc;
  } catch (err) {
    if (isPouchDBError(err) && err.name === "not_found") {
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
    } catch (err) {
      if (isPouchDBError(err) && err.name === "not_found") {
        infoDoc = { _id: "_local/info" };
      } else {
        throw err;
      }
    }

    // Apply updates.  Use Object.assign for partial updates.
    Object.assign(infoDoc, updates);
    await db.put(infoDoc);
  } catch (error) {
    console.error("Error updating info:", error);
    if (isPouchDBError(error)) {
      console.error(
        "PouchDB error details:",
        error.message,
        error.status,
        error.reason
      );
    }
    throw new Error(
      "Failed to update database information: " +
        (error instanceof Error ? error.message : String(error))
    );
  }
}

// --- Migration Function ---
async function migrateDatabase(db: PouchDB.Database) {
  try {
    // --- Get Current DB Version (from _local/info) ---
    let info = await getInfo(db);
    let currentVersion = 0; //default value
    if (info) {
      currentVersion = info.version;
    }
    // --- Migrations ---

    if (currentVersion < 1) {
      console.log("Migrating database to version 1...");
      // ... your migration logic for version 1 ...
      console.log("Migration to version 1 complete.");
    }

    // --- Update db version ---
    info.version = CURRENT_DB_VERSION;

    console.log("info", info);

    await updateInfo(db, info);
  } catch (error) {
    console.error("Database migration error:", error);
    throw error;
  }
}

// --- Initialization Function ---
export async function initializeFilamentDB() {
  console.log("initializeFilamentDB called");
  if (typeof window !== "undefined") {
    // console.log("initializeFilamentDB called 2");
    const db = new PouchDB("filament", { adapter: "idb" });

    try {
      await migrateDatabase(db); // Run migrations on initialization
      return db;
    } catch (error: unknown) {
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
