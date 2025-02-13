import PouchDB from "pouchdb";

async function getAllFilaments(db: PouchDB.Database): Promise<any[]> {
  if (!db) {
    console.error("Database is not initialized.");
    return [];
  }

  try {
    const result = await db.allDocs({
      include_docs: true, // Include the document content
      attachments: false, // Don't include attachments (if any)
    });

    // Map the rows to extract the document data
    const filaments = result.rows.map((row) => row.doc);
    return filaments;
  } catch (error: unknown) {
    console.error("Error getting all filaments:", error);

    if (error instanceof Error) {
      throw new Error(error.message); // Re-throw the error with type information
    } else if (typeof error === "string") {
      throw new Error(error);
    } else {
      throw new Error("An unknown error occurred while retrieving filaments.");
    }
  }
}

export default getAllFilaments;
