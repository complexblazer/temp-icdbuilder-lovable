import Papa from "papaparse";

/**
 * Parse a CSV file from an <input type="file"> File object.
 * Returns a Promise resolving to { data, fields }.
 */
export function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results);
      },
      error: (err) => reject(err),
    });
  });
}
