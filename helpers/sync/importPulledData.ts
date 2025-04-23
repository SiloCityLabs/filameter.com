import PouchDB from "pouchdb";
import { importDB } from "@/helpers/importDB";
import saveSettings from "@/helpers/database/settings/saveSettings";

export async function importPulledData(
  dbs: { filament: PouchDB.Database; settings: PouchDB.Database },
  pulledData: any
): Promise<{ success: boolean; message: string }> {
  try {
    // Import filament data
    if (pulledData.data && pulledData.data.regular) {
      await importDB(dbs.filament, {
        regular: pulledData.data.regular,
        local: pulledData.data.local || [],
      });
    }

    // Update sync settings with new timestamp
    if (pulledData.timestamp) {
      const syncSettings = {
        lastSynced: new Date(pulledData.timestamp).toISOString(),
      };
      await saveSettings(dbs.settings, { "scl-sync": syncSettings });
    }

    return {
      success: true,
      message: "Data imported successfully",
    };
  } catch (error) {
    console.error("Error importing pulled data:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to import data",
    };
  }
} 