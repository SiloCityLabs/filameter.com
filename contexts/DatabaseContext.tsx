"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import PouchDB from "pouchdb";
import PouchDBFind from "pouchdb-find";
import idbAdapter from "pouchdb-adapter-idb";
import { initializeSettingsDB } from "@/helpers/database/settings/initializeSettingsDB";
import { migrateFilamentDatabase } from "@/helpers/database/filament/initializeFilamentDB";

// Initialize Plugins
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
  children: ReactNode; // Use ReactNode for children type
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({
  children,
}) => {
  const [dbs, setDbs] = useState<{ [key: string]: PouchDB.Database | null }>(
    {}
  );
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isInitializedRef = useRef(false); // --- ADDED: Ref to track initialization ---

  useEffect(() => {
    // --- ADDED: Prevent re-initialization ---
    // Exit if already initialized or if running on server (belt-and-suspenders check)
    if (isInitializedRef.current || typeof window === "undefined") {
      return;
    }

    // Keep DB instances scoped within the effect if possible
    let filamentDbInstance: PouchDB.Database | null = null;
    let settingsDbInstance: PouchDB.Database | null = null;
    let isMounted = true; // Flag for async operations

    const initializeDBs = async () => {
      console.log("DatabaseProvider: Starting initialization..."); // Add logs
      const filamentDbName = "filament";
      const adapter = "idb";

      try {
        setError(null); // Clear previous errors

        // --- Handle Filament DB Destruction (Keep this logic if needed) ---
        if (localStorage.getItem("clearDatabase") === "true") {
          console.warn(
            "DatabaseProvider: clearDatabase flag found. Destroying filament DB."
          );
          localStorage.removeItem("clearDatabase");
          const tempFilamentDB = new PouchDB(filamentDbName, { adapter });
          try {
            await tempFilamentDB.destroy();
            console.log(
              "DatabaseProvider: Filament DB destroyed successfully."
            );
          } catch (destroyError) {
            console.error(
              "DatabaseProvider: Failed to destroy filament database:",
              destroyError
            );
            // Potentially set an error state here? Or just log and continue.
          }
          // Give IndexedDB a moment to process destruction? Might not be needed.
          // await new Promise(resolve => setTimeout(resolve, 100));
        }

        // --- Create/Open Filament DB ---
        console.log("DatabaseProvider: Creating/Opening Filament DB...");
        filamentDbInstance = new PouchDB(filamentDbName, { adapter });
        await filamentDbInstance.info(); // Verify connection
        console.log("DatabaseProvider: Filament DB connection verified.");

        // --- Run Filament Migrations ---
        console.log("DatabaseProvider: Running Filament migrations...");
        await migrateFilamentDatabase(filamentDbInstance);
        console.log("DatabaseProvider: Filament migrations complete.");

        // --- Initialize Settings DB ---
        console.log("DatabaseProvider: Initializing Settings DB...");
        settingsDbInstance = await initializeSettingsDB();
        if (!settingsDbInstance) {
          // Settings DB init handles its own errors/logs, but we check result
          throw new Error(
            "Settings database initialization failed or returned null."
          );
        }
        console.log("DatabaseProvider: Settings DB initialized.");

        // --- Set State ---
        if (isMounted) {
          // Check if component is still mounted
          console.log(
            "DatabaseProvider: Initialization successful. Setting state."
          );
          setDbs({
            filament: filamentDbInstance,
            settings: settingsDbInstance,
          });
          setIsReady(true);
          isInitializedRef.current = true; // --- ADDED: Mark initialization as complete ---
        } else {
          console.warn(
            "DatabaseProvider: Component unmounted during initialization. Aborting state update."
          );
          // Close instances if component unmounted before success?
          filamentDbInstance?.close().catch(/* handle error */);
          settingsDbInstance?.close().catch(/* handle error */);
        }
      } catch (initError) {
        console.error(
          "DatabaseProvider: Error during database initialization/migration:",
          initError
        );
        if (isMounted) {
          setError(
            initError instanceof Error ? initError.message : String(initError)
          );
          // Ensure DBs are null if init failed critically
          setDbs({ filament: null, settings: null });
          // Set ready to true even on error, so consumers know init attempt finished.
          // Consumers MUST check dbs.filament/dbs.settings for null.
          setIsReady(true);
          // Don't mark as initialized on error
          // isInitializedRef.current = true;
        }
      }
    };

    initializeDBs();

    // Cleanup Function
    return () => {
      isMounted = false; // Mark as unmounted
      console.log("DatabaseProvider: Cleanup Effect Triggered.");
    };
  }, []); // Empty dependency array is correct here

  return (
    <DatabaseContext.Provider value={{ dbs, isReady, error }}>
      {children}
    </DatabaseContext.Provider>
  );
};
