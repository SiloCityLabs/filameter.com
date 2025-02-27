import PouchDB from "pouchdb";

export async function importDB(db: PouchDB.Database | null, data: any[]) {
  if (!db) {
    console.error("Database not initialized.");
    return;
  }
  if (!data || data.length === 0) {
    console.warn("No data to import.");
    return;
  }
  try {
    const result = await db.bulkDocs(data);
    console.log("Import result:", result);

    // Check for conflicts and errors
    const errors = result.filter((res) => "error" in res); //check for errors
    if (errors.length > 0) {
      console.error("Import conflicts/errors:", errors);
      // Handle conflicts (e.g., show an error message to the user)
      throw new Error(
        "Failed to import some documents due to conflicts or errors."
      );
    }
  } catch (error) {
    console.error("Error during import:", error);
    throw error; // Re-throw to handle in the calling function (ManageDatabase component)
  }
}
