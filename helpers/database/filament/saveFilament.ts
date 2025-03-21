import { filamentSchema } from "@/helpers/database/filament/initializeFilamentDB";
import { v4 as uuidv4 } from "uuid";

export const saveFilament = async (db, data) => {
  if (db) {
    try {
      const { error, value: validatedData } = filamentSchema.validate(data);

      if (error) {
        console.error("Validation error:", error.details);
        return { success: false, error: error.details };
      }

      let doc = { ...validatedData };

      if (data._id && data._rev) {
        try {
          const existingDoc = await db.get(data._id);
          doc._id = data._id;
          doc._rev = existingDoc._rev;
        } catch (getErr: unknown) {
          if (getErr instanceof Error && getErr.name === "NotFoundError") {
            doc._id = uuidv4();
          } else {
            console.error(
              "Error getting existing document for update:",
              getErr
            );
            return {
              success: false,
              error: "Error getting document for update.",
            };
          }
        }
      } else {
        doc._id = data._id ? data._id : uuidv4();
      }

      const response = await db.put(doc);
      return { success: true, data: response };
    } catch (error: unknown) {
      console.error("Error adding filament:", error);

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
