import PouchDB from "pouchdb";
import { filamentSchema } from "@/helpers/filament/initializeFilamentDB";

export async function migrateFilamentDB(db: PouchDB.Database) {
  if (!db) {
    console.error("Database not initialized.");
    return;
  }
  try {
    const result = await db.allDocs({ include_docs: true });
    const docsToUpdate = result.rows
      .map((row) => row.doc)
      .filter((doc) => doc && typeof doc.total_weight === "undefined");

    if (docsToUpdate.length === 0) {
      console.info("No documents need updating.");
      return;
    }

    const updatedDocs = docsToUpdate
      .map((doc) => {
        // Apply the default value using Joi.
        const validatedDoc = filamentSchema.validate(
          { ...doc, total_weight: undefined },
          { stripUnknown: true }
        );
        if (validatedDoc.error) {
          console.error("Validation Error", validatedDoc.error);
          return null;
        }

        return validatedDoc.value;
      })
      .filter((doc) => doc !== null);

    if (updatedDocs.length > 0) {
      const bulkUpdateResult = await db.bulkDocs(updatedDocs);
    }
  } catch (error) {
    console.error("Error migrating database:", error);
  }
}
