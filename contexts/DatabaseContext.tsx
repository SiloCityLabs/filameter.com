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
      const adapter = "idb";

      try {
        if (localStorage.getItem("clearDatabase") === "true") {
          localStorage.removeItem("clearDatabase");
          const tempDB = new PouchDB(dbName, { adapter: adapter });
          await tempDB.destroy();
        }

        console.info(
          `Initializing PouchDB with name: ${dbName}, adapter: ${adapter}`
        );
        const newDb = new PouchDB(dbName, { adapter: adapter }); // Use 'idb'
        const info = await newDb.info();
        setDb(newDb);
        setIsReady(true);
      } catch (error) {
        console.error("Database initialization or destruction error:", error);
        setIsReady(true);
      }
    };

    initializeDB();
  }, []);

  return (
    <DatabaseContext.Provider value={{ db, isReady }}>
      {children}
    </DatabaseContext.Provider>
  );
};
