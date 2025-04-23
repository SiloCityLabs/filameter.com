// --- Helpers ---
import { v4 as uuidv4 } from "uuid";
import Joi from "joi";

/**
 * Saves or updates a document in the PouchDB database.
 * It validates the input data against the provided schema, handles updates
 * and new document creation, and manages potential errors during the process.
 *
 * @param db - The PouchDB database instance.
 * @param data - The data to be saved, can be a new document or an update.
 * @param dbSchema - The Joi schema for validating the data.
 * @param type - The type of the document being saved (e.g., 'feedback', 'user').
 *
 * @returns A Promise that resolves to an object with success and error properties.
 */
export const save = async (
  db: PouchDB.Database,
  data: any,
  dbSchema: Joi.ObjectSchema,
  type: string // Type of the document being saved (e.g., 'feedback', 'user')
): Promise<{ success: boolean; data?: any; error?: any }> => {
  // Check if the database is initialized
  if (db) {
    try {
      // Validate the input data against the provided schema
      const { error, value: validatedData } = dbSchema.validate(data);

      if (error) {
        // If validation fails
        console.error(`Validation error for ${type}:`, error.details);
        return { success: false, error: error.details }; // Return an error object with validation details
      }

      // Prepare the document for saving by spreading validated data
      let doc = { ...validatedData };

      // If the document has an _id and _rev, it's an update
      if (data._id && data._rev) {
        try {
          // Attempt to fetch the existing document from the database
          const existingDoc = await db.get(data._id);
          // Set the _id and _rev from the existing document to ensure it's an update
          doc._id = data._id;
          doc._rev = existingDoc._rev;
        } catch (getErr: unknown) {
          // Handle errors while fetching the existing document
          // If the document is not found, assign a new UUID for the creation
          // If other errors occured, report them.

          if (getErr instanceof Error && getErr.name === "NotFoundError") {
            doc._id = uuidv4();
          } else {
            console.error(
              `Error getting existing ${type} document for update:`,
              getErr
            );
            return {
              success: false,
              error: `Error getting ${type} document for update.`,
            };
          }
        }
      } else {
        // If there's no _id, it's a new document
        doc._id = data._id ? data._id : uuidv4();
      }

      const response = await db.put(doc); // Save or update the document in the database
      return { success: true, data: response };
    } catch (error: unknown) {
      // Handle errors during the save/update process
      console.error(`Error adding ${type}:`, error);

      // Return different error responses based on the error type
      if (error instanceof Error) {
        return { success: false, error: error.message };
      } else if (typeof error === "string") {
        return { success: false, error: error };
      } else {
        return { success: false, error: "An unknown error occurred." };
      }
    }
  } else {
    return { success: false, error: "Database not initialized" };
  }
};
