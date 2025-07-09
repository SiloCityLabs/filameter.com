import type { ForgotResponse } from '@/types/api';

/**
 * Sends a request to the API to trigger the "forgot key" email process.
 *
 * This function calls the main sync endpoint with the 'forgot' function parameter.
 * The backend will then look up the user by email and send them their sync keys.
 *
 * @param {string} email - The user's email address to send the recovery keys to.
 * @returns {Promise<ForgotResponse>} A promise that resolves with the API's response,
 * which is typically a message prompting the user to check their email.
 * @throws {Error} Throws an error if the API call fails or returns a non-ok status.
 */
export async function forgotSyncKey(email: string): Promise<ForgotResponse> {
  const url = process.env.NEXT_PUBLIC_APP_FILAMETER_SYNC_URL as string;
  const app = process.env.NEXT_PUBLIC_APP_FILAMETER_SYNC_APP as string;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ function: 'forgot', email: email, app: app }),
    });

    if (!response.ok) {
      // Try to parse the error response from the API, otherwise throw a generic error
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      } catch (_e) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const data = (await response.json()) as ForgotResponse;
    return data;
  } catch (error) {
    console.error('Error in forgotSyncKey API call:', error);
    // Re-throw the error to be caught by the calling function in the hook
    throw error;
  }
}
