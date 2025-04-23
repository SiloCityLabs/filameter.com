// --- PouchDB ---
import PouchDB from "pouchdb";
import PouchFind from "pouchdb-find";

PouchDB.plugin(PouchFind);

/**
 * Retrieves a document from the database based on a specific column's value.
 *
 * @param {PouchDB.Database} db - The PouchDB database instance.
 * @param {string} columnName - The name of the column to search in.
 * @param {any} columnValue - The value to search for in the specified column.
 * @param {string} type - The type of the document (used for error reporting).
 *
 * @returns {Promise<any | null>} A promise that resolves to the found document or null if not found.
 */
async function getDocumentByColumn(
  db: PouchDB.Database,
  columnName: string,
  columnValue: any,
  type: string
): Promise<any | null> {
  if (!db) {
    console.error("Database is not initialized.");
    return null;
  }

  try {
    const result = await db.find({
      selector: {
        [columnName]: columnValue,
      },
      limit: 1,
    });

    if (result.docs.length > 0) {
      return result.docs[0];
    } else {
      return null; // No documents found
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        `Error getting document with ${columnName} = ${columnValue} for type ${type}:`,
        error
      );
      throw new Error(error.message);
    } else if (typeof error === "string") {
      throw new Error(error);
    } else {
      throw new Error(`An unknown error occurred while retrieving document.`);
    }
  }
}

export default getDocumentByColumn;
