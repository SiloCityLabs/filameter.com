import PouchDB from "pouchdb";

async function saveSettings(
  db: PouchDB.Database,
  settings: { [key: string]: any }
): Promise<void> {
  try {
    const settingsToSave = Object.entries(settings).map(
      async ([name, value]) => {
        const doc = await db.get(name).catch(() => null);
        const newValue =
          typeof value === "object" ? JSON.stringify(value) : String(value);

        if (doc) {
          return db.put({
            ...doc,
            value: newValue,
          });
        } else {
          return db.put({
            _id: name,
            name: name,
            value: newValue,
          });
        }
      }
    );

    await Promise.all(settingsToSave);
  } catch (error: unknown) {
    console.error("Error saving settings to database:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("An unknown error occurred while saving settings.");
    }
  }
}

export default saveSettings;
