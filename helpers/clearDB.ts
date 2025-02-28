// helpers/clearDB.ts
import PouchDB from "pouchdb";

export async function clearDB(db: PouchDB.Database) {
  try {
    await db.destroy();
    console.log("Database destroyed successfully.");
  } catch (error) {
    console.error("Error destroying database:", error);
    throw error; // Re-throw to handle in the calling function
  }
}
