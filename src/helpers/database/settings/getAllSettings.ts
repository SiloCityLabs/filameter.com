// --- PouchDB ---
import PouchDB from 'pouchdb';
// --- Types ---
import type { Setting } from '@/types/Settings';

/**
 * Retrieves all settings from the database and formats them into a single object.
 *
 * This function fetches all documents from the settings database, filtering out
 * any PouchDB design documents. It then attempts to parse the 'value' of each
 * setting as JSON. If parsing is successful, the parsed object is used; otherwise,
 * the raw string value is used as a fallback.
 *
 * @param {PouchDB.Database} db - The PouchDB settings database instance.
 * @returns {Promise<{ [key: string]: unknown }>} A promise that resolves to an object
 * where keys are the setting names and values are the corresponding setting values.
 * @throws {Error} Throws an error if fetching from the database fails.
 */
async function getAllSettings(db: PouchDB.Database): Promise<{ [key: string]: unknown }> {
  if (!db) {
    console.error('Database is not initialized.');
    return {};
  }

  try {
    const result = await db.allDocs<Setting>({ include_docs: true, attachments: false });

    const settingsObject: { [key: string]: unknown } = {};

    result.rows
      .filter((row) => row.doc && !row.id.startsWith('_design/'))
      .forEach((row) => {
        if (row.doc && row.doc.name && row.doc.value) {
          try {
            // Attempt to parse the setting value as JSON
            settingsObject[row.doc.name] = JSON.parse(row.doc.value);
          } catch (_error) {
            // If parsing fails, use the raw value as a fallback
            console.warn(`Could not parse JSON for setting "${row.doc.name}". Using raw value.`);
            settingsObject[row.doc.name] = row.doc.value;
          }
        }
      });

    return settingsObject;
  } catch (error: unknown) {
    console.error('Error getting all settings:', error);

    if (error instanceof Error) {
      throw new Error(error.message);
    } else if (typeof error === 'string') {
      throw new Error(error);
    } else {
      throw new Error('An unknown error occurred while retrieving settings.');
    }
  }
}

export default getAllSettings;
