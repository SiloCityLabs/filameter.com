import PouchDB from "pouchdb";

export async function importDB(db: PouchDB.Database, docs: any[]) {
  try {
    const result = await db.bulkDocs(docs);
    //check for conflicts/errors
    const errors = result.filter((doc: any) => doc.error);

    if (errors.length > 0) {
      console.error("Errors during import:", errors);
      throw new Error("Some documents failed to import.");
    }
  } catch (error) {
    console.error("Failed to import into database:", error);
    throw error;
  }
}
