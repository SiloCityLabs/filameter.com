export async function setupSync(email: string): Promise<any> {
  const url = process.env.NEXT_PUBLIC_APP_FILAMETER_SYNC_URL as string;
  const app = process.env.NEXT_PUBLIC_APP_FILAMETER_SYNC_APP as string;
  console.log("NEXT_PUBLIC_APP_FILAMETER_SYNC_URL", url);
  console.log("NEXT_PUBLIC_APP_FILAMETER_SYNC_APP", app);
  console.log("email", email);

  return {
    key: "6HBIcqlZJhUByUr2poo1Xo1dumMl55YJ",
    status: "success",
  };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        function: "create",
        email: email,
        app: app,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("data", data);
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
    const result = await setupSync(userEmail);
    console.log("API response:", result);
  } catch (error) {
    console.error("Failed to create sync:", error);
  }
}

exampleUsage();
