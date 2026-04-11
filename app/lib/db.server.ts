import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema.server";

const client = postgres(process.env.DATABASE_URL!, {
  prepare: false,      // required for Supabase pgbouncer (transaction mode)
  idle_timeout: 20,    // drop idle connections after 20s to avoid stale hangs
  connect_timeout: 10, // fail fast if the pooler doesn't respond
});

export const db = drizzle(client, { schema });
