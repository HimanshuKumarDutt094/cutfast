import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer, jwt } from "better-auth/plugins";

import { db } from "@/server/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "pg" or "mysql"
  }),
  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    // github: {
    //   clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
    //   clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
    //   redirectURI: "http://localhost:3000/api/auth/callback/github",
    // },
  },
  plugins: [jwt(), bearer()],
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  trustedOrigins: ["*"],
});
