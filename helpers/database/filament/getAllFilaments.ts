import PouchDB from "pouchdb";
import type { Filament } from "@/types/Filament"; // Ensure correct import path

// Define the structure for a row that includes the 'doc' field,
// using PouchDB's type for existing documents.
interface RowWithExistingDoc<T extends {}> {
  id: string; // The row ID (often same as doc._id)
  key: string; // The key emitted by the view/query
  value: { rev: string }; // The row value (just the revision here)
  // Use PouchDB's ExistingDocument<T>. This type represents T & { _id: string; _rev: string; }
  doc: PouchDB.Core.ExistingDocument<T>;
}

// Define the expected return type, ensuring calc_weight is required
type FilamentWithCalcWeight = Filament & { calc_weight: number };

async function getAllFilaments(
  db: PouchDB.Database
): Promise<FilamentWithCalcWeight[]> {
  if (!db) {
    console.error("Database is not initialized.");
    return [];
  }

  try {
    // Fetch documents. The <Filament> generic tells PouchDB the expected content structure.
    const result = await db.allDocs<Filament>({
      include_docs: true,
      attachments: false,
    });

    // Use the corrected RowWithExistingDoc interface in the type guard
    const data = result.rows
      .filter(
        (
          row
        ): row is RowWithExistingDoc<Filament> => // Asserting the row contains an ExistingDocument
          Boolean(row.doc) && !row.id.startsWith("_design/")
      )
      .map((row) => {
        // row is now correctly typed as RowWithExistingDoc<Filament>
        // row.doc is type PouchDB.Core.ExistingDocument<Filament>
        // This means doc has all properties of Filament PLUS required _id and _rev
        const doc = row.doc;

        const totalWeight =
          typeof doc.total_weight === "number" ? doc.total_weight : 0;
        const usedWeight =
          typeof doc.used_weight === "number" ? doc.used_weight : 0;

        // Spread ExistingDocument<Filament> properties and add calc_weight
        // The result is compatible with FilamentWithCalcWeight
        return {
          ...doc,
          calc_weight: totalWeight - usedWeight,
        };
      });

    // Type is compatible with FilamentWithCalcWeight[]
    return data;
  } catch (error: unknown) {
    console.error("Error getting all filaments:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to retrieve filaments: ${error.message}`);
    } else if (typeof error === "string") {
      throw new Error(error);
    } else {
      throw new Error("An unknown error occurred while retrieving filaments.");
    }
  }
}

export default getAllFilaments;
