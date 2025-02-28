// helpers/importDB.ts
import PouchDB from "pouchdb";

export async function importDB(
  db: PouchDB.Database,
  data: { regular: any[]; local: any[] }
) {
  try {
    const regularDocs = data.regular || [];
    const localDocs = data.local || [];
    const allDocs = regularDocs.concat(localDocs);

    for (const doc of allDocs) {
      try {
        const result = await db.put(doc);
      } catch (err: any) {
        if (err.name === "conflict") {
          try {
            const existingDoc = await db.get(doc._id); // Get existing doc
            const updateResult = await db.put({
              ...doc,
              _rev: existingDoc._rev,
            });
          } catch (innerErr: any) {
            console.error(`Error updating document ${doc._id}:`, innerErr);
            const message =
              innerErr instanceof Error ? innerErr.message : String(innerErr);
            throw new Error(`Failed to update document ${doc._id}: ${message}`);
          }
        } else {
          console.error(`Error importing document ${doc._id}:`, err);
          throw new Error(
            `Failed to import document ${doc._id}: ${err.message}`
          );
        }
      }
    }
  } catch (error) {
    console.error("Failed to import into database:", error);
    throw error;
  }
}
