import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import PouchDB from "pouchdb";
import { initializeFilamentDB } from "@/helpers/filament/initializeFilamentDB"; // Import your initialization function

interface DatabaseContextProps {
  db: PouchDB.Database | null;
  isLoadingDB: boolean;
}

const DatabaseContext = createContext<DatabaseContextProps>({
  db: null,
  isLoadingDB: true,
});

export const useDatabase = () => useContext(DatabaseContext);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [db, setDb] = useState<PouchDB.Database | null>(null);
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const dbInitialized = useRef(false);

  useEffect(() => {
    let isMounted = true;
    async function initDb() {
      if (!dbInitialized.current) {
        const initializedDb = await initializeFilamentDB();
        if (isMounted) {
          setDb(initializedDb);
          dbInitialized.current = true;
        }
      }
      setIsLoadingDB(false);
    }

    initDb();

    return () => {
      isMounted = false;
      if (db) {
        db.close().catch((err) =>
          console.error("Error closing database:", err)
        ); //properly handle
      }
    };
  }, []);

  return (
    <DatabaseContext.Provider value={{ db, isLoadingDB }}>
      {children}
    </DatabaseContext.Provider>
  );
};
