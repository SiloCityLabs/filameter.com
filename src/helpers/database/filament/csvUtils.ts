import Papa from 'papaparse';
import { Filament } from '@/types/Filament';
import { normalizeColorToHex } from '@/data/colors';

export const FILAMENT_FIELDS: { key: keyof Filament; label: string }[] = [
  { key: 'brand', label: 'Brand' },
  { key: 'filament', label: 'Filament Name' },
  { key: 'material', label: 'Material Type' },
  { key: 'color', label: 'Color' },
  { key: 'used_weight', label: 'Used Weight (g)' },
  { key: 'total_weight', label: 'Total Weight (g)' },
  { key: 'price', label: 'Price' },
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

              if (!value) value = '';

              // If mapped to a specific field (and not "Add to Comments")
              if (mappedField && mappedField !== 'ignore') {
                // --- Special Logic for Weights ---
                if (mappedField === 'total_weight') {
                  const num = parseFloat(value.replace(/[^0-9.]/g, ''));
                  newFilament.total_weight = isNaN(num) ? 1000 : num;
                } else if (mappedField === 'used_weight') {
                  const num = parseFloat(value.replace(/[^0-9.]/g, ''));
                  newFilament.used_weight = isNaN(num) ? 0 : num;
                }else if (mappedField === 'price') {
                  const num = parseFloat(value.replace(/[^0-9.]/g, ''));
                  newFilament.price = isNaN(num) ? 0 : num;
                } else if (mappedField === 'color') {
                  // Convert color to hex format (handles hex values and HTML color names)
                  newFilament.color = normalizeColorToHex(value);
                }
                // --- Standard Strings ---
                else {
                  if (value) newFilament[mappedField] = value;
                }
              }
              // LOGIC UPDATE: If mapped to 'ignore' (Add to Comments), append it.
              else if (mappedField === 'ignore' && value) {
                unmappedNotes += `${csvHeader}: ${value}\n`;
              }
            });

            // Defaults
            if (newFilament.total_weight === undefined) newFilament.total_weight = 1000;
            if (newFilament.used_weight === undefined) newFilament.used_weight = 0;

            // Finalize Comments
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
