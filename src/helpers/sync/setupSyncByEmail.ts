import type { CreateResponse } from '@/types/api';

/**
 * Sets up synchronization by creating a new sync key associated with an email.
 *
 * This function calls the 'create' endpoint on the API. The backend generates
 * a new key, associates it with the provided email, and sends a verification
 * link to that email address.
 *
 * @param {string} email - The user's email address to associate with the new sync key.
 * @returns {Promise<CreateResponse>} A promise that resolves with the API's response,
 * which is typically a message prompting the user to check their email.
 * @throws {Error} Throws an error if the API call fails or returns a non-ok status.
 */
export async function setupSyncByEmail(email: string): Promise<CreateResponse> {
  const url = process.env.NEXT_PUBLIC_APP_FILAMETER_SYNC_URL as string;
  const app = process.env.NEXT_PUBLIC_APP_FILAMETER_SYNC_APP as string;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ function: 'create', email: email, app: app }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as CreateResponse;
    return data;
  } catch (error) {
    console.error('Error making API call:', error);
    throw error;
  }
}
