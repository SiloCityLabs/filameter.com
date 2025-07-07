import type { PullResponse } from '@/types/api';

/**
 * Fetches synchronized data from the API using a specific key.
 *
 * This function sends a request to the 'pull' endpoint to retrieve the
 * entire data payload associated with the given synchronization key.
 *
 * @param {string} key - The synchronization key for the data to be pulled.
 * @returns {Promise<PullResponse>} A promise that resolves with the API's response,
 * containing the synchronized data on success.
 * @throws {Error} Throws an error if the API call fails or returns a non-ok status.
 */
export async function pullData(key: string): Promise<PullResponse> {
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
