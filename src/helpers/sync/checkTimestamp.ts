import type { TimestampResponse } from '@/types/api';

/**
 * Checks the remote timestamp of a synchronized file.
 *
 * This function calls the 'timestamp' endpoint to get the last modification
 * time of the data associated with a specific key. This is used to determine
 * if the local data is out of sync with the remote data.
 *
 * @param {string} key - The synchronization key to check the timestamp for.
 * @returns {Promise<TimestampResponse>} A promise that resolves with the API's response,
 * containing the timestamp on success.
 * @throws {Error} Throws an error if the API call fails or returns a non-ok status.
 */
export async function checkTimestamp(key: string): Promise<TimestampResponse> {
  const url = process.env.NEXT_PUBLIC_APP_FILAMETER_SYNC_URL as string;
  const app = process.env.NEXT_PUBLIC_APP_FILAMETER_SYNC_APP as string;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ function: 'timestamp', key: key, app: app }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as TimestampResponse;
    return data;
  } catch (error) {
    console.error('Error making API call:', error);
    throw error;
  }
}
