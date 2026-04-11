import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { wasteEvents } from "../app/lib/schema.server";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

type WasteMethod = "burn" | "shred" | "flush" | "yeet" | "blackhole" | "feed";

const METHODS: WasteMethod[] = ["burn", "shred", "flush", "yeet", "blackhole", "feed"];

const NICKNAMES: (string | null)[] = [
  "FlameLord", "VoidMaster", "YeetKing", "ShredQueen",
  "FlushGordon", "VoidFeeder", "AshBaron", "BurnNotice",
  "TrashPanda", "MoneyPit", null, null, null,
];

const MESSAGES: (string | null)[] = [
  "Worth every penny of nothing", "My wallet screamed", "Goodbye savings",
  "This is fine", "Money is just paper anyway", "YOLO",
  "My therapist told me not to", "For science", "No ragrets",
  "Burning bright", null, null, null, null,
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randAmount(): number {
  const r = Math.random();
  if (r < 0.4) return +(Math.random() * 100 + 1).toFixed(2);
  if (r < 0.7) return +(Math.random() * 500 + 100).toFixed(2);
  if (r < 0.85) return +(Math.random() * 2000 + 500).toFixed(2);
  if (r < 0.95) return +(Math.random() * 10000 + 2500).toFixed(2);
  return +(Math.random() * 50000 + 10000).toFixed(2);
}

function randDate(daysBack: number): Date {
  return new Date(Date.now() - Math.random() * daysBack * 24 * 60 * 60 * 1000);
}

console.log("Clearing existing data...");
await db.delete(wasteEvents);

console.log("Seeding waste events...");

const rows: (typeof wasteEvents.$inferInsert)[] = [];

// 200 random events over 90 days
for (let i = 0; i < 200; i++) {
  rows.push({
    amount: randAmount(),
    method: pick(METHODS),
    nickname: pick(NICKNAMES),
    message: pick(MESSAGES),
    createdAt: randDate(90),
  });
}

// Notable big burns for Wall of Shame
rows.push(
  { amount: 50000, method: "yeet",      nickname: "YeetKing",   message: "Half a lakh, gone. You're welcome.", createdAt: randDate(30) },
  { amount: 25000, method: "burn",      nickname: "FlameLord",  message: "Watch it burn",                      createdAt: randDate(20) },
  { amount: 15000, method: "blackhole", nickname: null,         message: null,                                 createdAt: randDate(15) },
  { amount: 10000, method: "blackhole", nickname: "VoidMaster", message: "Into the void",                      createdAt: randDate(10) },
  { amount: 8000,  method: "shred",     nickname: "ShredQueen", message: "Shredded with style",                createdAt: randDate(5) },
);

await db.insert(wasteEvents).values(rows);

const result = await db.select().from(wasteEvents);
const total = result.reduce((sum, r) => sum + r.amount, 0);
console.log(`Seeded ${result.length} events, total: ₹${total.toLocaleString("en-IN")}`);

await client.end();
