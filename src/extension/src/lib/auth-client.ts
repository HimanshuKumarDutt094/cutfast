import { createAuthClient } from "better-auth/react";

// Create the Better Auth client for the extension
export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:3000",
    // You can add additional client configuration here
    // For example, custom fetch options, plugins, etc.
});

// Export commonly used methods for convenience
export const { signIn, signOut, useSession, signUp, getSession } = authClient;

// Export the full client for advanced usage
export default authClient;
