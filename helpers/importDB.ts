export async function importDB(db, jsonData) {
  if (!db) {
    throw new Error("Database not initialized.");
  }

  if (
    !Array.isArray(jsonData) &&
    typeof jsonData === "object" &&
    jsonData !== null
  ) {
    //if jsonData is an object put it in an array
    jsonData = [jsonData];
  } else if (!Array.isArray(jsonData)) {
    throw new Error(
      "Invalid JSON data: must be an array of objects or a single object."
    );
  }

  try {
    await db.bulkDocs(jsonData); // Use bulkDocs for efficient import
  } catch (error) {
    console.error("PouchDB import error:", error);
    throw error; // Re-throw the error to be caught in the component
  }
}
