import { db } from "./db.server";
import { wasteEvents } from "./schema.server";
import { desc, sql, eq, count, sum, lt, and, or } from "drizzle-orm";
import { MONEY_TYPES, getMoneyType, getMoneyTypeKey, type MoneyType } from "./utils";

// ── Types ──────────────────────────────────────────────────

export interface WasteEventRow {
  id: number;
  amount: number;
  method: string;
  nickname: string | null;
  message: string | null;
  createdAt: string; // ISO string for serialization
}

export interface LeaderboardEntry {
  nickname: string;
  totalWasted: number;
  wasteCount: number;
  tier: MoneyType;
}

export interface PlatformStats {
  totalWasted: number;
  totalEvents: number;
  totalBurners: number;
}

// ── Helpers ────────────────────────────────────────────────

function serializeEvent(row: typeof wasteEvents.$inferSelect): WasteEventRow {
  return {
    id: row.id,
    amount: row.amount,
    method: row.method,
    nickname: row.nickname,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
  };
}

// ── Queries ────────────────────────────────────────────────

export async function getRecentEvents(limit = 8): Promise<WasteEventRow[]> {
  const rows = await db
    .select()
    .from(wasteEvents)
    .orderBy(desc(wasteEvents.createdAt))
    .limit(limit);
  return rows.map(serializeEvent);
}

export async function getAllEvents(): Promise<WasteEventRow[]> {
  const rows = await db
    .select()
    .from(wasteEvents)
    .orderBy(desc(wasteEvents.createdAt));
  return rows.map(serializeEvent);
}

// ── Paginated Events ───────────────────────────────────────

export const PAGE_SIZE = 24; // multiple of 4,3,2 — fills complete rows at all grid breakpoints

export interface EventsPage {
  events: WasteEventRow[];
  nextCursor: number | null; // null = no more pages
}

function tierAmountFilter(tier?: MoneyType) {
  if (!tier) return undefined;
  const t = MONEY_TYPES[tier];
  if (!t) return undefined;
  return t.max === Infinity
    ? sql`${wasteEvents.amount} >= ${t.min}`
    : sql`${wasteEvents.amount} >= ${t.min} AND ${wasteEvents.amount} <= ${t.max}`;
}

export async function getEventsPaginated({
  cursorId,
  tier,
  sort = "newest",
  limit = PAGE_SIZE,
}: {
  cursorId?: number;
  tier?: MoneyType;
  sort?: "newest" | "biggest";
  limit?: number;
}): Promise<EventsPage> {
  const fetchLimit = limit + 1; // fetch one extra to detect next page
  const amountFilter = tierAmountFilter(tier);

  if (sort === "newest") {
    const rows = await db
      .select()
      .from(wasteEvents)
      .where(and(
        amountFilter,
        cursorId ? lt(wasteEvents.id, cursorId) : undefined,
      ))
      .orderBy(desc(wasteEvents.id))
      .limit(fetchLimit);

    const hasMore = rows.length > limit;
    const events = rows.slice(0, limit).map(serializeEvent);
    return { events, nextCursor: hasMore ? events[events.length - 1].id : null };
  }

  // "biggest" sort — composite cursor on (amount DESC, id DESC).
  let cursorAmount: number | undefined;
  if (cursorId) {
    const cursorRows = await db
      .select({ amount: wasteEvents.amount })
      .from(wasteEvents)
      .where(eq(wasteEvents.id, cursorId))
      .limit(1);
    cursorAmount = cursorRows[0]?.amount;
  }

  const cursorCondition =
    cursorId !== undefined && cursorAmount !== undefined
      ? or(
          lt(wasteEvents.amount, cursorAmount),
          and(eq(wasteEvents.amount, cursorAmount), lt(wasteEvents.id, cursorId))
        )
      : undefined;

  const rows = await db
    .select()
    .from(wasteEvents)
    .where(and(amountFilter, cursorCondition))
    .orderBy(desc(wasteEvents.amount), desc(wasteEvents.id))
    .limit(fetchLimit);

  const hasMore = rows.length > limit;
  const events = rows.slice(0, limit).map(serializeEvent);
  return { events, nextCursor: hasMore ? events[events.length - 1].id : null };
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const result = await db
    .select({
      totalWasted: sum(wasteEvents.amount),
      totalEvents: count(),
    })
    .from(wasteEvents);

  const burnersResult = await db
    .select({ count: count() })
    .from(
      db
        .selectDistinct({ nickname: wasteEvents.nickname })
        .from(wasteEvents)
        .where(sql`${wasteEvents.nickname} IS NOT NULL`)
        .as("distinct_nicks")
    );

  return {
    totalWasted: Number(result[0]?.totalWasted ?? 0),
    totalEvents: result[0]?.totalEvents ?? 0,
    totalBurners: burnersResult[0]?.count ?? 0,
  };
}

export async function getLeaderboard(timeframe: "all-time" | "monthly"): Promise<LeaderboardEntry[]> {
  const rows = timeframe === "monthly"
    ? await db
        .select({
          nickname: wasteEvents.nickname,
          totalWasted: sum(wasteEvents.amount).as("total_wasted"),
          wasteCount: count().as("waste_count"),
        })
        .from(wasteEvents)
        .where(sql`${wasteEvents.nickname} IS NOT NULL AND ${wasteEvents.createdAt} >= NOW() - INTERVAL '30 days'`)
        .groupBy(wasteEvents.nickname)
        .orderBy(sql`total_wasted DESC`)
    : await db
        .select({
          nickname: wasteEvents.nickname,
          totalWasted: sum(wasteEvents.amount).as("total_wasted"),
          wasteCount: count().as("waste_count"),
        })
        .from(wasteEvents)
        .where(sql`${wasteEvents.nickname} IS NOT NULL`)
        .groupBy(wasteEvents.nickname)
        .orderBy(sql`total_wasted DESC`);

  return rows.map((row) => {
    const totalWasted = Number(row.totalWasted ?? 0);
    return {
      nickname: row.nickname!,
      totalWasted,
      wasteCount: row.wasteCount,
      tier: getMoneyTypeKey(totalWasted),
    };
  });
}

// ── Chart Data ─────────────────────────────────────────────

export async function getWasteOverTime() {
  const rows = await db
    .select({
      month: sql<string>`TO_CHAR(${wasteEvents.createdAt}, 'YYYY-MM')`.as("month"),
      amount: sum(wasteEvents.amount).as("amount"),
    })
    .from(wasteEvents)
    .groupBy(sql`TO_CHAR(${wasteEvents.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`TO_CHAR(${wasteEvents.createdAt}, 'YYYY-MM') ASC`);

  return rows.map((r) => {
    const [year, mon] = r.month.split("-");
    const label = new Date(Number(year), Number(mon) - 1).toLocaleDateString("en-US", { month: "short" });
    return { label, amount: Number(r.amount ?? 0) };
  });
}

export async function getWasteOverTimePeriod(period: "7d" | "30d" | "3m" | "all") {
  if (period === "all") {
    return getWasteOverTime();
  }

  if (period === "7d" || period === "30d") {
    const days = period === "7d" ? 7 : 30;
    const rows = await db
      .select({
        dateKey: sql<string>`TO_CHAR(${wasteEvents.createdAt}, 'YYYY-MM-DD')`.as("dateKey"),
        amount: sum(wasteEvents.amount).as("amount"),
      })
      .from(wasteEvents)
      .where(sql`${wasteEvents.createdAt} >= NOW() - INTERVAL '${sql.raw(String(days))} days'`)
      .groupBy(sql`TO_CHAR(${wasteEvents.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${wasteEvents.createdAt}, 'YYYY-MM-DD') ASC`);

    const dataMap = new Map(rows.map((r) => [r.dateKey, Number(r.amount ?? 0)]));
    const cutoffMs = Date.now() - days * 24 * 60 * 60 * 1000;
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(cutoffMs + (i + 1) * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split("T")[0];
      const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return { label, amount: dataMap.get(key) ?? 0 };
    });
  }

  // 3m — weekly buckets
  const rows = await db
    .select({
      week: sql<string>`TO_CHAR(${wasteEvents.createdAt}, 'IYYY-IW')`.as("week"),
      amount: sum(wasteEvents.amount).as("amount"),
    })
    .from(wasteEvents)
    .where(sql`${wasteEvents.createdAt} >= NOW() - INTERVAL '90 days'`)
    .groupBy(sql`TO_CHAR(${wasteEvents.createdAt}, 'IYYY-IW')`)
    .orderBy(sql`TO_CHAR(${wasteEvents.createdAt}, 'IYYY-IW') ASC`);

  return rows.map((r, i) => ({
    label: `Wk ${i + 1}`,
    amount: Number(r.amount ?? 0),
  }));
}

export async function getWasteByDayOfWeek() {
  const rows = await db
    .select({
      day: sql<number>`EXTRACT(DOW FROM ${wasteEvents.createdAt})::INTEGER`.as("day"),
      total: sum(wasteEvents.amount).as("total"),
      events: count().as("events"),
    })
    .from(wasteEvents)
    .groupBy(sql`EXTRACT(DOW FROM ${wasteEvents.createdAt})`)
    .orderBy(sql`EXTRACT(DOW FROM ${wasteEvents.createdAt}) ASC`);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dataMap = new Map(rows.map((r) => [r.day, { total: Number(r.total ?? 0), events: r.events }]));

  return dayNames.map((name, i) => ({
    day: name,
    total: dataMap.get(i)?.total ?? 0,
    events: dataMap.get(i)?.events ?? 0,
  }));
}

export async function getWasteByMoneyType() {
  // Single query with CASE bucketing — avoids N parallel connections
  const rows = await db
    .select({
      key: sql<string>`
        CASE
          WHEN ${wasteEvents.amount} >= 1     AND ${wasteEvents.amount} < 100   THEN 'coin'
          WHEN ${wasteEvents.amount} >= 100   AND ${wasteEvents.amount} < 500   THEN 'note'
          WHEN ${wasteEvents.amount} >= 500   AND ${wasteEvents.amount} < 1000  THEN 'splash'
          WHEN ${wasteEvents.amount} >= 1000  AND ${wasteEvents.amount} < 5000  THEN 'bag'
          WHEN ${wasteEvents.amount} >= 5000  AND ${wasteEvents.amount} < 25000 THEN 'fire'
          WHEN ${wasteEvents.amount} >= 25000 AND ${wasteEvents.amount} < 100000 THEN 'diamond'
          ELSE 'crown'
        END
      `.as("key"),
      value: sum(wasteEvents.amount).as("value"),
    })
    .from(wasteEvents)
    .groupBy(sql`1`);

  return rows
    .map((r) => {
      const tier = MONEY_TYPES[r.key as keyof typeof MONEY_TYPES];
      if (!tier) return null;
      return { type: tier.label, value: Number(r.value ?? 0), color: tier.color };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null && r.value > 0);
}

export async function getWasteByAmountTier() {
  // Single query with CASE bucketing — avoids N parallel connections
  const tierLabels: Record<number, string> = {
    1: "₹1–₹10", 2: "₹10–₹25", 3: "₹25–₹50",
    4: "₹50–₹100", 5: "₹100–₹250", 6: "₹250+",
  };

  const rows = await db
    .select({
      tierOrder: sql<number>`
        CASE
          WHEN ${wasteEvents.amount} >= 1   AND ${wasteEvents.amount} < 10  THEN 1
          WHEN ${wasteEvents.amount} >= 10  AND ${wasteEvents.amount} < 25  THEN 2
          WHEN ${wasteEvents.amount} >= 25  AND ${wasteEvents.amount} < 50  THEN 3
          WHEN ${wasteEvents.amount} >= 50  AND ${wasteEvents.amount} < 100 THEN 4
          WHEN ${wasteEvents.amount} >= 100 AND ${wasteEvents.amount} < 250 THEN 5
          ELSE 6
        END
      `.as("tier_order"),
      count: count().as("count"),
    })
    .from(wasteEvents)
    .groupBy(sql`1`)
    .orderBy(sql`1 ASC`);

  const dataMap = new Map(rows.map((r) => [r.tierOrder, r.count]));
  return [1, 2, 3, 4, 5, 6].map((o) => ({ tier: tierLabels[o], count: dataMap.get(o) ?? 0 }));
}

export async function getHourlyDistribution() {
  const rows = await db
    .select({
      hour: sql<number>`EXTRACT(HOUR FROM ${wasteEvents.createdAt})::INTEGER`.as("hour"),
      count: count().as("count"),
    })
    .from(wasteEvents)
    .groupBy(sql`EXTRACT(HOUR FROM ${wasteEvents.createdAt})`)
    .orderBy(sql`EXTRACT(HOUR FROM ${wasteEvents.createdAt}) ASC`);

  const hourMap = new Map(rows.map((r) => [r.hour, r.count]));
  const labels = [
    "12am", "1am", "2am", "3am", "4am", "5am",
    "6am", "7am", "8am", "9am", "10am", "11am",
    "12pm", "1pm", "2pm", "3pm", "4pm", "5pm",
    "6pm", "7pm", "8pm", "9pm", "10pm", "11pm",
  ];

  return Array.from({ length: 12 }, (_, i) => {
    const h = i * 2;
    return {
      hour: labels[h],
      count: (hourMap.get(h) ?? 0) + (hourMap.get(h + 1) ?? 0),
    };
  });
}

// ── SSE / Live Data ───────────────────────────────────────

export async function getEventsSince(sinceTimestamp: number): Promise<WasteEventRow[]> {
  const since = new Date(sinceTimestamp).toISOString();
  const rows = await db
    .select()
    .from(wasteEvents)
    .where(sql`${wasteEvents.createdAt} > ${since}::timestamptz`)
    .orderBy(desc(wasteEvents.createdAt));
  return rows.map(serializeEvent);
}

export async function getLatestEventTimestamp(): Promise<number> {
  const rows = await db
    .select({ ts: wasteEvents.createdAt })
    .from(wasteEvents)
    .orderBy(desc(wasteEvents.createdAt))
    .limit(1);
  return rows[0] ? rows[0].ts.getTime() : Date.now();
}

// ── Single Event ──────────────────────────────────────────

export async function getEventById(id: number) {
  const rows = await db
    .select()
    .from(wasteEvents)
    .where(eq(wasteEvents.id, id))
    .limit(1);
  return rows[0] ? serializeEvent(rows[0]) : null;
}

// ── Wall of Waste ──────────────────────────────────────────

export async function getTopSingleBurns(limit = 10) {
  const rows = await db
    .select()
    .from(wasteEvents)
    .orderBy(desc(wasteEvents.amount))
    .limit(limit);

  return rows.map((row, idx) => ({
    rank: idx + 1,
    id: row.id,
    nickname: row.nickname,
    message: row.message,
    amount: row.amount,
    method: row.method,
    when: row.createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }));
}

// ── Insert ────────────────────────────────────────────────

export async function insertBurnEvent({
  amount,
  method,
  nickname,
  message,
}: {
  amount: number;
  method: string;
  nickname?: string | null;
  message?: string | null;
}): Promise<WasteEventRow> {
  const rows = await db
    .insert(wasteEvents)
    .values({
      amount,
      method,
      nickname: nickname || null,
      message: message || null,
    })
    .returning();
  return serializeEvent(rows[0]);
}
