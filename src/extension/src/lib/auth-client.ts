import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { getBaseUrl } from "./api-url";

// Create the Better Auth client for the extension with dynamic base URL
export const authClient = createAuthClient({
	baseURL: await getBaseUrl(),
	  plugins: [adminClient()],

});
export const { useSession, signIn, signOut, signUp, getSession } = authClient;
