// helpers/exportDB.ts
import PouchDB from "pouchdb";

export async function exportDB(db: PouchDB.Database) {
  try {
    // Fetch regular documents
    const result = await db.allDocs({ include_docs: true });
    const docs = result.rows
      .filter((row) => row.doc && !row.id.startsWith("_design/")) // Exclude design docs
      .map((row) => row.doc);

    // Fetch local documents
    const localResult = await db.allDocs({
      include_docs: true,
      startkey: "_local/",
      endkey: "_local/\uffff",
    });
    const localDocs = localResult.rows
      .filter((row) => row.doc) // No need to filter design docs here, as they won't match
      .map((row) => row.doc);

    // Combine into a single object for export
    const exportData = {
      regular: docs,
      local: localDocs,
    };

    // Create a Blob and trigger download
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `filameter-db-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export database:", error);
    throw error;
  }
}
