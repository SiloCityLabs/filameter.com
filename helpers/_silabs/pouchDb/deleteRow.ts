/**
 * Deletes a row from the database by its ID.
 *
 * @param {PouchDB.Database} db - The PouchDB database instance.
 * @param {string} id - The ID of the document to delete.
 * @param {string} type - The type of the document being deleted (for logging purposes).
 *
 * @returns {Promise<boolean>} - A promise that resolves to true if the document was deleted, false otherwise.
 */
async function deleteRow(
  db: PouchDB.Database,
  id: string,
  type: string
): Promise<boolean> {
  if (!db) {
    console.error("Database is not initialized.");
    return false;
  }

  try {
    const doc = await db.get(id);
    if (!doc) {
      console.error(`${type} with ID ${id} not found for deletion.`);
      return false;
    }
    const response = await db.remove(doc); // Delete the document
    return true;
  } catch (error: unknown) {
    console.error(`Error deleting ${type} with ID ${id}:`, error);

    if (error instanceof Error) {
      if (error.name === "NotFoundError") {
        console.error(`Filament with ID ${id} not found for deletion.`);
        return false;
      } else {
        throw new Error(error.message);
      }
    } else if (typeof error === "string") {
      throw new Error(error);
    } else {
      throw new Error(`An unknown error occurred while deleting the ${type}.`);
    }
  }
}

export default deleteRow;
