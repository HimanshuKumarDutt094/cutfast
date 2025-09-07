import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { admin, bearer, jwt } from "better-auth/plugins";
import { count, eq } from "drizzle-orm";

import { db } from "@/server/db";
import { config, user } from "@/server/db/schema";

// Helper function to get user count
async function getUserCount() {
  const result = await db.select({ count: count() }).from(user);
  return result[0]?.count || 0;
}

// Custom plugin for user limits
const userLimitPlugin = () => ({
  id: "user-limit",
  hooks: {
    before: [
      {
        matcher: (context: any) => context.path === "/sign-up/email",
        handler: createAuthMiddleware(async (ctx) => {
          // Check if signup is enabled
          const configResult = await db
            .select()
            .from(config)
            .where(eq(config.id, "global"))
            .limit(1);

          const appConfig = configResult[0];

          if (!appConfig?.enableSignup) {
            throw new APIError("FORBIDDEN", {
              message: "User registration is currently disabled.",
            });
          }

          const userCount = await getUserCount();
          const maxUsers = parseInt(appConfig.maxUsers || "100");

          if (userCount >= maxUsers) {
            throw new APIError("FORBIDDEN", {
              message: "User limit reached. Contact administrator.",
            });
          }

          return ctx;
        }),
      },
    ],
  },
});

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
  plugins: [jwt(), bearer(), userLimitPlugin(), admin()],
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  trustedOrigins: ["*"],
});
