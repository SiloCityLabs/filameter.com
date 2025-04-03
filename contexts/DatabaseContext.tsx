import React, { createContext, useContext, useState, useEffect } from "react";
import PouchDB from "pouchdb";
import PouchDBFind from "pouchdb-find";
import idbAdapter from "pouchdb-adapter-idb"; // Use 'pouchdb-adapter-indexeddb' for explicit modern adapter
import { initializeSettingsDB } from "@/helpers/database/settings/initializeSettingsDB"; // Import settings initialization
import { migrateFilamentDatabase } from "@/helpers/database/filament/initializeFilamentDB"; // Import the migration function

PouchDB.plugin(PouchDBFind);
PouchDB.plugin(idbAdapter);

interface DatabaseContextProps {
  dbs: { [key: string]: PouchDB.Database | null };
  isReady: boolean;
  error: string | null;
}

const DatabaseContext = createContext<DatabaseContextProps>({
  dbs: {},
  isReady: false,
  error: null,
});

export const useDatabase = () => useContext(DatabaseContext);

interface DatabaseProviderProps {
  children: React.ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({
  children,
}) => {
  const [dbs, setDbs] = useState<{ [key: string]: PouchDB.Database | null }>(
    {}
  );
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null); // Optional error state

  useEffect(() => {
    let filamentDb: PouchDB.Database | null = null;
    let settingsDb: PouchDB.Database | null = null;

    const initializeDBs = async () => {
      const filamentDbName = "filament";
      const adapter = "idb";

      try {
        setError(null);

        // --- Handle Filament DB Destruction ---
        if (localStorage.getItem("clearDatabase") === "true") {
          localStorage.removeItem("clearDatabase");
          // Use a temporary instance just for destruction to avoid conflicts
          const tempFilamentDB = new PouchDB(filamentDbName, { adapter });
          try {
            await tempFilamentDB.destroy();
          } catch (destroyError) {
            console.error(
              "DatabaseProvider: Failed to destroy filament database:",
              destroyError
            );
          }
        }

        // --- Create/Open Filament DB ---
        filamentDb = new PouchDB(filamentDbName, { adapter });

        // Verify connection (optional but good practice)
        await filamentDb.info();

        // --- Run Filament Migrations ---
        await migrateFilamentDatabase(filamentDb);

        // --- Initialize Settings DB ---
        settingsDb = await initializeSettingsDB();
        if (!settingsDb) {
          throw new Error("Settings database initialization failed.");
        }

        // --- Set State ---
        setDbs({
          filament: filamentDb,
          settings: settingsDb,
        });
        setIsReady(true);
      } catch (initError) {
        console.error(
          "DatabaseProvider: Error during database initialization/migration:",
          initError
        );
        setError(
          initError instanceof Error ? initError.message : String(initError)
        );
        // Set dbs to null
        setDbs({ filament: null, settings: null });
        setIsReady(true);
      }
    };

    initializeDBs();

    return () => {
      filamentDb
        ?.close()
        .catch((e) => console.error("Error closing filament DB:", e));
      settingsDb
        ?.close()
        .catch((e) => console.error("Error closing settings DB:", e));
    };
  }, []);

  return (
    <DatabaseContext.Provider value={{ dbs, isReady, error }}>
      {children}
    </DatabaseContext.Provider>
  );
};
