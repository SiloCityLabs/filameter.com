import { gunzipSync } from "fflate";

export async function fetchAndDecompressGzip(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch file");

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const decompressed = gunzipSync(uint8Array);
    const text = new TextDecoder().decode(decompressed);

    return JSON.parse(text);
  } catch (err) {
    console.error("Error decompressing file:", err);
  }
}
