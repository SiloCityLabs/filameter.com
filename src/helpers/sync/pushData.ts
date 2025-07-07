import type { PushResponse } from '@/types/api';

/**
 * Pushes data to the Filameter Sync API.
 *
 * This function sends a POST request to the specified API endpoint
 * with the provided data. It's designed to synchronize data from
 * the application to a central data store.
 *
 * @param {string} key - The unique identifier for the data being pushed.
 * @param {object} exportData - The data object to be sent.
 * @returns {Promise<PushResponse>} A promise that resolves with the response from the API.
 * @throws {Error} Throws an error if the API call fails or returns a non-ok status.
 */
export async function pushData(key: string, exportData: object): Promise<PushResponse> {
  const url = process.env.NEXT_PUBLIC_APP_FILAMETER_SYNC_URL as string;
  const app = process.env.NEXT_PUBLIC_APP_FILAMETER_SYNC_APP as string;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ function: 'push', email: '', key: key, app: app, data: exportData }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as PushResponse;
    return data;
  } catch (error) {
    console.error('Error making API call:', error);
    throw error;
  }
}
