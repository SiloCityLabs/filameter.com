import PouchDB from "pouchdb";
import PouchFind from "pouchdb-find";

PouchDB.plugin(PouchFind);

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
    });

    if (result.docs.length > 0) {
      return result.docs;
    } else {
      return null; // No documents found
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        `Error getting documents with ${columnName} = ${columnValue} for type ${type}:`,
        error
      );
      throw new Error(error.message);
    } else if (typeof error === "string") {
      throw new Error(error);
    } else {
      throw new Error(`An unknown error occurred while retrieving documents.`);
    }
  }
}

export default getDocumentByColumn;
