// --- PouchDB ---
import PouchDB from 'pouchdb';
// --- Helpers ---
import { importDB } from '@/helpers/importDB';
import saveSettings from '@/helpers/database/settings/saveSettings';
// --- Types ---
import type { SyncFile } from '@/types/api';

/**
 * Imports data pulled from the sync server into the local PouchDB databases.
 *
 * This function takes the synchronized data object, imports the documents
 * into the 'filament' database, and updates the 'lastSynced' timestamp
 * in the settings database.
 *
 * @param dbs - An object containing the PouchDB database instances for 'filament' and 'settings'.
 * @param {PouchDB.Database} dbs.filament - The database for filament data.
 * @param {PouchDB.Database} dbs.settings - The database for application settings.
 * @param {SyncFile} pulledData - The complete data object retrieved from the sync server.
 * @returns {Promise<{ success: boolean; message: string }>} An object indicating the outcome of the import process.
 */
export async function importPulledData(
  dbs: { filament: PouchDB.Database; settings: PouchDB.Database },
  pulledData: SyncFile
): Promise<{ success: boolean; message: string }> {
  try {
    // Import filament data if it exists in the pulled data
    if (pulledData.data && pulledData.data.regular) {
      await importDB(dbs.filament, {
        regular: pulledData.data.regular,
        local: pulledData.data.local || [],
      });
    }

    // Update sync settings with the new timestamp from the pulled data
    if (pulledData.timestamp) {
      const syncSettings = { lastSynced: new Date(pulledData.timestamp).toISOString() };
      await saveSettings(dbs.settings, { 'scl-sync': syncSettings });
    }

    return { success: true, message: 'Data imported successfully' };
  } catch (error) {
    console.error('Error importing pulled data:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to import data',
    };
  }
}
