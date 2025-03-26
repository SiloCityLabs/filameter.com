export async function createSync(email: string): Promise<any> {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_APP_FILAMETER_SYNC_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          function: "create",
          email: email,
          app: "sync-test-123",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error making API call:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
}

// Example usage:
async function exampleUsage() {
  try {
    const userEmail = "test@example.com"; // Replace with the actual email
    const result = await createSync(userEmail);
    console.log("API response:", result);
  } catch (error) {
    console.error("Failed to create sync:", error);
  }
}

exampleUsage();
