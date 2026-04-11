import { pgTable, text, real, serial, timestamp, index } from "drizzle-orm/pg-core";

export const wasteEvents = pgTable(
  "waste_events",
  {
    id: serial("id").primaryKey(),
    amount: real("amount").notNull(), // Amount in INR (min ₹1, max ₹9,99,999)
    method: text("method").notNull(), // "burn" | "shred" | "flush" | "yeet" | "blackhole" | "feed"
    nickname: text("nickname"), // null = Anonymous
    message: text("message"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_nickname").on(table.nickname),
    index("idx_created_at").on(table.createdAt),
    index("idx_method").on(table.method),
  ]
);
