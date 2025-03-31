import { fetchAndDecompressGzip } from "@/helpers/sync/fetchAndDecompressGzip";

export async function setupSyncByKey(key: string): Promise<any> {
  const url = process.env.NEXT_PUBLIC_APP_FILAMETER_SYNC_URL as string;
  const app = process.env.NEXT_PUBLIC_APP_FILAMETER_SYNC_APP as string;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        function: "pull",
        key: key,
        app: app,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "success") {
      const accountData = await fetchAndDecompressGzip(data.url);
      return { ...data, ...accountData };
    }
    return data;
  } catch (error) {
    console.error("Error making API call:", error);
    throw error;
  }
}
