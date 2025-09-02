import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer, jwt } from "better-auth/plugins";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		// Add social providers as needed
		// github: {
		//   clientId: process.env.GITHUB_CLIENT_ID!,
		//   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
		// },
	},
	plugins: [jwt(), bearer()],
	baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
});
