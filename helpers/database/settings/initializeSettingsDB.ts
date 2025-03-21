import PouchDB from "pouchdb";
import Joi from "joi";

// --- Initialization Function ---
export async function initializeSettingsDB(): Promise<PouchDB.Database | null> {
  if (typeof window !== "undefined") {
    return new PouchDB("settings", { adapter: "idb" });
  } else {
    console.warn(
      "[Settings] Database initialization should only happen on the client-side."
    );
    return null;
  }
}

// --- Joi Schema ---
export const settingSchema = Joi.object({
  _id: Joi.string().allow(""),
  _rev: Joi.string().allow(""),
  name: Joi.string().required(),
  value: Joi.string().required(),
});
