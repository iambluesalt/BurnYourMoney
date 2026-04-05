import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.server";
import path from "node:path";

const dbPath = path.resolve("data/waste.db");

const sqlite = new Database(dbPath);

// Security: enable WAL mode for better concurrency + foreign keys
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
