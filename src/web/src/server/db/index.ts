import { neon } from "@neondatabase/serverless";
import { drizzle as neonDrizzle } from "drizzle-orm/neon-http";
import { drizzle as normalDrizzle } from "drizzle-orm/postgres-js";

import { env } from "@/env";
import postgres from "postgres";
import * as schema from "./schema";

const isProduction = env.NODE_ENV === "production";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForNeonDb = globalThis as unknown as {
  conn: ReturnType<typeof neon> | undefined;
};

const globalForNormalDb = globalThis as unknown as {
  conn: ReturnType<typeof postgres> | undefined;
};

let db: ReturnType<typeof neonDrizzle> | ReturnType<typeof normalDrizzle>;

if (isProduction) {
  // Use Neon for production
  const neonClient = globalForNeonDb.conn ?? neon(env.DATABASE_URL);
  if (env.NODE_ENV !== "production") globalForNeonDb.conn = neonClient;

  db = neonDrizzle({ client: neonClient, schema });
} else {
  // Use regular PostgreSQL for development and other environments
  const postgresClient = globalForNormalDb.conn ?? postgres(env.DATABASE_URL);
  if (env.NODE_ENV !== "production") globalForNormalDb.conn = postgresClient;

  db = normalDrizzle(postgresClient, { schema });
}

export { db };
