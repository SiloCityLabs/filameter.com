export async function clearDB(db) {
  try {
    if (!db) {
      // Important: Check if db is valid
      console.warn("Database not initialized. Cannot clear.");
      return;
    }

    await db.destroy(); // Destroy the database
    console.info(`Database "${db.name}" destroyed.`);
  } catch (err) {
    console.error("Error destroying database:", err);
  }
}
