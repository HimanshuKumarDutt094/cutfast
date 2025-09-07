import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/env";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const sql = neon(env.DATABASE_URL);
const globalForDb = globalThis as unknown as {
  conn: typeof sql | undefined;
};

const conn = globalForDb.conn ?? sql;
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle({ client: sql, schema });
