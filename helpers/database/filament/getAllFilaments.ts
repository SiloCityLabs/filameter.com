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

    //Add calculated weight
    const data = result.rows
      .filter((row) => row.doc && !row.id.startsWith("_design/"))
      .map((row) => {
        const doc = row.doc;
        if (doc) {
          const totalWeight =
            typeof doc.total_weight === "number" ? doc.total_weight : 0;
          const usedWeight =
            typeof doc.used_weight === "number" ? doc.used_weight : 0;

          return {
            ...doc,
            calc_weight: totalWeight - usedWeight,
          };
        }
        return null;
      })
      .filter((doc) => doc !== null);

    return data;
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
