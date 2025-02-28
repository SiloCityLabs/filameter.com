// contexts/DatabaseContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import PouchDB from "pouchdb";
import PouchDBFind from "pouchdb-find";

PouchDB.plugin(PouchDBFind);

interface DatabaseContextProps {
  db: PouchDB.Database | null;
  isReady: boolean;
}

const DatabaseContext = createContext<DatabaseContextProps>({
  db: null,
  isReady: false,
});

export const useDatabase = () => useContext(DatabaseContext);

interface DatabaseProviderProps {
  children: React.ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({
  children,
}) => {
  const [db, setDb] = useState<PouchDB.Database | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeDB = async () => {
      const dbName = "filament";
      const adapter = "idb"; // CHANGE BACK TO 'idb'

      try {
        // Check for the clear flag
        if (localStorage.getItem("clearDatabase") === "true") {
          console.log("Clearing database...");
          localStorage.removeItem("clearDatabase");
          const tempDB = new PouchDB(dbName, { adapter: adapter }); // Use 'idb'
          await tempDB.destroy();
          console.log("Database destroyed.");
        }

        console.log(
          `Initializing PouchDB with name: ${dbName}, adapter: ${adapter}`
        );
        const newDb = new PouchDB(dbName, { adapter: adapter }); // Use 'idb'
        const info = await newDb.info();
        console.log("PouchDB info:", info);
        setDb(newDb);
        setIsReady(true);
      } catch (error) {
        console.error("Database initialization or destruction error:", error);
        setIsReady(true); // Ensure isReady is set even on error
      }
    };

    initializeDB();
  }, []); // Empty dependency array

  return (
    <DatabaseContext.Provider value={{ db, isReady }}>
      {children}
    </DatabaseContext.Provider>
  );
};
