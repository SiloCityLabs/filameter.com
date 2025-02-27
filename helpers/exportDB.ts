import PouchDB from "pouchdb";

export async function exportDB(db: PouchDB.Database) {
  // 1. Get regular documents
  const regularDocs = await db.allDocs({ include_docs: true });
  console.log("regularDocs.rows:", regularDocs.rows); // Add this line
  const regularDocsData = regularDocs.rows.map((row) => row.doc);

  // 2. Get local documents
  const localDocs = await db.allDocs({
    include_docs: true,
    startkey: "_local/",
    endkey: "_local/\uffff",
  });
  console.log("localDocs.rows:", localDocs.rows); // Add this line
  const localDocsData = localDocs.rows.map((row) => row.doc);

  // 3. Combine the results (optional: put them in separate arrays)
  const allData = {
    regular: regularDocsData,
    local: localDocsData,
  };

  // 4. Create Blob and trigger download (using combined data)
  const jsonData = JSON.stringify(allData);
  const blob = new Blob([jsonData], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `pouchdb_backup_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
