import type { PullResponse } from '@/types/api';

/**
 * Initiates a data pull synchronization process using a key.
 *
 * This function sends a request to the Filameter Sync API to pull data
 * associated with a specific key. It's the first step in setting up
 * synchronization for a device or session using a simple key-based lookup.
 *
 * @param {string} key - The synchronization key to pull data for.
 * @returns {Promise<PullResponse>} A promise that resolves with the data returned from the API.
 * @throws {Error} Throws an error if the API call fails or returns a non-ok status.
 */
export async function setupSyncByKey(key: string): Promise<PullResponse> {
  const url = process.env.NEXT_PUBLIC_APP_FILAMETER_SYNC_URL as string;
  const app = process.env.NEXT_PUBLIC_APP_FILAMETER_SYNC_APP as string;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ function: 'pull', key: key, app: app }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as PullResponse;
    return data;
  } catch (error) {
    console.error('Error making API call:', error);
    throw error;
  }
}
