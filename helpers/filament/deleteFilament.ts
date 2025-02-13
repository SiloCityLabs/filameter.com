import PouchDB from "pouchdb";

async function deleteFilament(
  db: PouchDB.Database,
  id: string
): Promise<boolean> {
  if (!db) {
    console.error("Database is not initialized.");
    return false; // Or throw an error if you prefer
  }

  try {
    const doc = await db.get(id); // Get the document to delete
    if (!doc) {
      console.error(`Filament with ID ${id} not found for deletion.`);
      return false;
    }
    const response = await db.remove(doc); // Delete the document
    console.log(`Filament with ID ${id} deleted:`, response);
    return true; // Indicate successful deletion
  } catch (error: unknown) {
    console.error(`Error deleting filament with ID ${id}:`, error);

    if (error instanceof Error) {
      // Handle error types
      if (error.name === "NotFoundError") {
        console.error(`Filament with ID ${id} not found for deletion.`); // Log but don't re-throw
        return false;
      } else {
        throw new Error(error.message); // Re-throw other errors
      }
    } else if (typeof error === "string") {
      throw new Error(error);
    } else {
      throw new Error("An unknown error occurred while deleting the filament.");
    }
  }
}

export default deleteFilament;
