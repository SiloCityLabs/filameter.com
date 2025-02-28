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

    console.log("importDB: allDocs to be imported:", allDocs); // Log all docs

    for (const doc of allDocs) {
      try {
        const result = await db.put(doc); // Try to put the document
        console.log(
          "importDB: db.put result for doc._id:",
          doc._id,
          "result:",
          result
        ); // Log *after* each put
      } catch (err: any) {
        if (err.name === "conflict") {
          // Conflict Handling
          try {
            const existingDoc = await db.get(doc._id); // Get existing doc
            const updateResult = await db.put({
              ...doc,
              _rev: existingDoc._rev,
            }); // Update, preserving _rev
            console.log(
              "importDB: Document updated after conflict, doc._id:",
              doc._id,
              "result:",
              updateResult
            ); // Log after update
          } catch (innerErr: any) {
            console.error(`Error updating document ${doc._id}:`, innerErr);
            const message =
              innerErr instanceof Error ? innerErr.message : String(innerErr);
            throw new Error(`Failed to update document ${doc._id}: ${message}`);
          }
        } else {
          // If it's not a conflict, it's a different error; re-throw
          console.error(`Error importing document ${doc._id}:`, err);
          throw new Error(
            `Failed to import document ${doc._id}: ${err.message}`
          );
        }
      }
    }
    console.log("Import successful");
  } catch (error) {
    console.error("Failed to import into database:", error);
    throw error; // Re-throw for handling in the component
  }
}
