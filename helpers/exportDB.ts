import PouchDB from "pouchdb";
import { isPouchDBError } from "@/helpers/isPouchDBError";

export async function exportDB(db: PouchDB.Database) {
  try {
    // Fetch regular documents
    const result = await db.allDocs({ include_docs: true });
    const docs = result.rows
      .filter((row) => row.doc && !row.id.startsWith("_design/"))
      .map((row) => row.doc);

    // Fetch local documents
    let localDocs: PouchDB.Core.Document<any>[] = [];

    // Add all local document IDs
    const knownLocalIds = ["_local/info"];
    for (const docId of knownLocalIds) {
      try {
        const doc = await db.get(docId);
        localDocs.push(doc);
      } catch (err) {
        if (isPouchDBError(err) && err.name !== "not_found") {
          throw err;
        }
      }
    }

    const exportData = {
      regular: docs,
      local: localDocs,
    };

    // Create a Blob and trigger download (no change here)
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
