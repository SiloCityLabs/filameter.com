import {
  initializeFilamentDB,
  filamentSchema,
} from "@/helpers/initializeFilamentDB";
import { v4 as uuidv4 } from "uuid";

export const addFilament = async (db, filamentData) => {
  if (db) {
    try {
      const { error, value: validatedData } =
        filamentSchema.validate(filamentData);

      if (error) {
        console.error("Validation error:", error.details);
        return { success: false, error: error.details };
      }

      const doc = {
        _id: uuidv4(),
        ...validatedData,
      };

      const response = await db.put(doc);
      console.log("Filament added:", response);
      return { success: true, data: response }; // Return success and data
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
