import Papa from 'papaparse';
import { Filament } from '@/types/Filament';

// Removed 'comments' so it cannot be explicitly mapped.
// "Add to Comments" is now the exclusive way to populate notes.
export const FILAMENT_FIELDS: { key: keyof Filament; label: string }[] = [
  { key: 'filament', label: 'Brand / Name' },
  { key: 'material', label: 'Material Type' },
  { key: 'color', label: 'Color' } as any,
  { key: 'total_weight', label: 'Total Weight (g)' },
  { key: 'used_weight', label: 'Used Weight (g)' },
  { key: 'location', label: 'Storage Location' },
];

export const getCsvHeaders = (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      preview: 1,
      step: (results) => {
        if (results.meta.fields) {
          resolve(results.meta.fields);
        } else {
          reject(new Error('No headers found in CSV'));
        }
      },
      error: (err) => reject(err),
    });
  });
};

export const parseAndMapCsv = (
  file: File,
  mapping: Record<string, keyof Filament | 'ignore'>
): Promise<Filament[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData: Filament[] = results.data
          .map((row: any) => {
            if (Object.values(row).every((val) => !val)) return null;

            const newFilament: Partial<Filament> = {};
            let unmappedNotes = '';

            Object.keys(row).forEach((csvHeader) => {
              const mappedField = mapping[csvHeader];
              let value = row[csvHeader]?.trim();

              if (!value) value = ''; // Ensure we have a string to work with

              if (mappedField && mappedField !== 'ignore') {
                // --- Special Logic for Weights ---
                if (mappedField === 'total_weight') {
                  const num = parseFloat(value.replace(/[^0-9.]/g, ''));
                  // Default to 1000 if empty or NaN
                  newFilament.total_weight = isNaN(num) ? 1000 : num;
                } else if (mappedField === 'used_weight') {
                  const num = parseFloat(value.replace(/[^0-9.]/g, ''));
                  // Default to 0 if empty or NaN
                  newFilament.used_weight = isNaN(num) ? 0 : num;
                }
                // --- Standard Strings ---
                else {
                  if (value) newFilament[mappedField] = value;
                }
              } else if (mappedField !== 'ignore' && value) {
                // If the field is "ignore" (Add to Comments) and has a value, add it to notes
                unmappedNotes += `${csvHeader}: ${value}\n`;
              }
            });

            // If we didn't map weights, ensure defaults are applied
            // (Note: This covers the case where the USER didn't map the column at all)
            if (newFilament.total_weight === undefined) newFilament.total_weight = 1000;
            if (newFilament.used_weight === undefined) newFilament.used_weight = 0;

            if (unmappedNotes) {
              const separator = newFilament.comments ? '\n\n--- Imported Data ---\n' : '';
              newFilament.comments =
                (newFilament.comments || '') + separator + unmappedNotes.trim();
            }

            return {
              filament: newFilament.filament || 'Imported Filament',
              material: newFilament.material || 'PLA',
              comments: newFilament.comments || '',
              ...newFilament,
            } as Filament;
          })
          .filter((item): item is Filament => item !== null);

        resolve(parsedData);
      },
      error: (err) => reject(err),
    });
  });
};
