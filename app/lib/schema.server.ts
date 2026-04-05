import { sqliteTable, text, real, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const wasteEvents = sqliteTable(
  "waste_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    amount: real("amount").notNull(), // Amount in INR (min ₹1, max ₹9,99,999)
    method: text("method").notNull(), // "burn" | "shred" | "flush" | "yeet" | "blackhole" | "feed"
    nickname: text("nickname"), // null = Anonymous
    message: text("message"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("idx_nickname").on(table.nickname),
    index("idx_created_at").on(table.createdAt),
    index("idx_method").on(table.method),
  ]
);
