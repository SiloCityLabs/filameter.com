import { v4 as uuidv4 } from "uuid";
import Joi from "joi";

export const save = async (
  db: PouchDB.Database,
  data: any,
  dbSchema: Joi.ObjectSchema,
  type: string
) => {
  if (db) {
    try {
      const { error, value: validatedData } = dbSchema.validate(data);

      if (error) {
        console.error(`Validation error for ${type}:`, error.details);
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
        doc._id = data._id ? data._id : uuidv4();
      }

      const response = await db.put(doc);
      return { success: true, data: response };
    } catch (error: unknown) {
      console.error(`Error adding ${type}:`, error);

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
