import PouchDB from "pouchdb";
import PouchDBFind from "pouchdb-find";
import idbAdapter from "pouchdb-adapter-idb";
import { migrateFilamentDatabase } from "@/helpers/database/filament/initializeFilamentDB";
import { initializeSettingsDB } from "@/helpers/database/settings/initializeSettingsDB";

// --- Initialize Plugins  ---
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(idbAdapter);

// --- Module-level variables to hold instances and promise ---
let filamentDBInstance: PouchDB.Database | null = null;
let settingsDBInstance: PouchDB.Database | null = null;
let initializationPromise: Promise<{
  filament: PouchDB.Database;
  settings: PouchDB.Database;
}> | null = null;

async function performInitialization(): Promise<{
  filament: PouchDB.Database;
  settings: PouchDB.Database;
}> {
  const filamentDbName = "filament";
  const adapter = "idb";

  // --- Handle Filament DB Destruction ---
  if (localStorage.getItem("clearDatabase") === "true") {
    console.warn(
      "Singleton Initializer: clearDatabase flag found. Destroying filament DB."
    );
    localStorage.removeItem("clearDatabase");
    const tempFilamentDB = new PouchDB(filamentDbName, { adapter });
    try {
      await tempFilamentDB.destroy();
      console.log("Singleton Initializer: Filament DB destroyed successfully.");
    } catch (destroyError) {
      console.error(
        "Singleton Initializer: Failed to destroy filament database:",
        destroyError
      );
    }
  }

  // --- Create/Open and Migrate Filament DB ---
  const filamentDb = new PouchDB(filamentDbName, { adapter });
  await filamentDb.info();
  await migrateFilamentDatabase(filamentDb); // Run migrations

  // --- Initialize Settings DB ---
  const settingsDb = await initializeSettingsDB();
  if (!settingsDb) {
    throw new Error(
      "Singleton Initializer: Settings DB Initialization Failed (returned null)"
    );
  }

  // --- Store instances and return ---
  filamentDBInstance = filamentDb;
  settingsDBInstance = settingsDb;
  return { filament: filamentDBInstance, settings: settingsDBInstance };
}

// --- Exported function to access the databases ---
export function getDatabases(): Promise<{
  filament: PouchDB.Database;
  settings: PouchDB.Database;
}> {
  // Ensure this only runs client-side
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Database cannot be accessed on the server.")
    );
  }

  // If initialization promise doesn't exist, create it by calling performInitialization
  if (!initializationPromise) {
    initializationPromise = performInitialization();
  }

  return initializationPromise;
}
