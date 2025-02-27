export async function exportDB(db) {
  const allDocs = await db.allDocs({ include_docs: true });
  const jsonData = JSON.stringify(allDocs.rows.map((row) => row.doc));

  // Create a Blob and trigger download
  const blob = new Blob([jsonData], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "pouchdb_backup.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
