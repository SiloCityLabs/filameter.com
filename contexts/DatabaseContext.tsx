"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getDatabases } from "@/utils/db";

// --- Context Definition ---
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
  children: ReactNode;
}
export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({
  children,
}) => {
  const [dbs, setDbs] = useState<{ [key: string]: PouchDB.Database | null }>(
    {}
  );
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getDatabases()
      .then((initializedDbs) => {
        // Set state only if the component is still mounted
        if (isMounted) {
          setDbs(initializedDbs);
          setIsReady(true);
          setError(null);
        }
      })
      .catch((initError) => {
        if (isMounted) {
          console.error(
            "DatabaseProvider: Error getting singleton DBs:",
            initError
          );
          setError(
            initError instanceof Error ? initError.message : String(initError)
          );
          setDbs({});
          setIsReady(true);
        } else {
          console.error(
            "DatabaseProvider: Component unmounted after DB init error:",
            initError
          );
        }
      });

    // Cleanup function just needs to handle the mount flag
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DatabaseContext.Provider value={{ dbs, isReady, error }}>
      {children}
    </DatabaseContext.Provider>
  );
};
