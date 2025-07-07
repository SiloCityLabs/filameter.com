// --- PouchDB ---
import PouchDB from 'pouchdb';

/**
 * Saves or updates one or more settings in the PouchDB database.
 *
 * This function iterates over an object of key-value pairs. For each setting,
 * it checks if a document with that key already exists.
 * - If it exists, the existing document is updated with the new value.
 * - If it does not exist, a new document is created.
 * Objects are stringified before being saved.
 *
 * @param {PouchDB.Database} db - The PouchDB settings database instance.
 * @param settings - An object where keys are the setting names (_id) and
 * values are the settings content to be saved.
 * @throws {Error} Throws an error if saving any of the settings fails.
 */
async function saveSettings(
  db: PouchDB.Database,
  settings: { [key: string]: unknown }
): Promise<void> {
  try {
    const settingsToSave = Object.entries(settings).map(async ([name, value]) => {
      // Try to get the existing document, return null if not found.
      const doc = await db.get(name).catch(() => null);

      // Stringify objects, otherwise convert to string.
      const newValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

      if (doc) {
        // If doc exists, update it with the new value.
        return db.put({ ...doc, value: newValue });
      } else {
        // If doc doesn't exist, create a new one.
        return db.put({ _id: name, name: name, value: newValue });
      }
    });

    // Wait for all the save/update operations to complete.
    await Promise.all(settingsToSave);
  } catch (error: unknown) {
    console.error('Error saving settings to database:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('An unknown error occurred while saving settings.');
    }
  }
}

export default saveSettings;
