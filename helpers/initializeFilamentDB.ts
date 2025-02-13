import PouchDB from "pouchdb";
import { v4 as uuidv4 } from "uuid";
import Joi from "joi";

export async function initializeFilamentDB() {
  try {
    if (typeof window !== "undefined") {
      const db = new PouchDB("filament");

      const dbInfo = await db.info(); // Optional: For debugging
      console.log("Database Info:", dbInfo);

      // Create indexes (very important for performance)
      // await db.createIndex({
      //   index: { fields: ["filament"] },
      //   name: "filament-index",
      // });

      return db;
    } else {
      console.warn(
        "Database initialization should only happen on the client-side."
      );
      return null;
    }
  } catch (error) {
    console.error("Error initializing database:", error);
    return null;
  }
}

// Schema for data validation using Joi
export const filamentSchema = Joi.object({
  filament: Joi.string().required(),
  material: Joi.string().required(),
  used_weight: Joi.number().min(0).default(0),
  location: Joi.string().allow(""),
  comments: Joi.string().allow(""),
});
