import { db } from "./db.server";
import { wasteEvents } from "./schema.server";
import { desc, sql, eq, count, sum, lt, and, or } from "drizzle-orm";
import type { WasteMethod } from "./utils";

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
  topMethod: WasteMethod;
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

export function getRecentEvents(limit = 8): WasteEventRow[] {
  const rows = db
    .select()
    .from(wasteEvents)
    .orderBy(desc(wasteEvents.createdAt))
    .limit(limit)
    .all();
  return rows.map(serializeEvent);
}

export function getAllEvents(): WasteEventRow[] {
  const rows = db
    .select()
    .from(wasteEvents)
    .orderBy(desc(wasteEvents.createdAt))
    .all();
  return rows.map(serializeEvent);
}

// ── Paginated Events ───────────────────────────────────────

export const PAGE_SIZE = 25;

export interface EventsPage {
  events: WasteEventRow[];
  nextCursor: number | null; // null = no more pages
}

export function getEventsPaginated({
  cursorId,
  method,
  sort = "newest",
  limit = PAGE_SIZE,
}: {
  cursorId?: number;
  method?: string;
  sort?: "newest" | "biggest";
  limit?: number;
}): EventsPage {
  const fetchLimit = limit + 1; // fetch one extra to detect next page

  if (sort === "newest") {
    // Cursor on id (auto-increment = insertion order). Stable even with concurrent inserts.
    const rows = db
      .select()
      .from(wasteEvents)
      .where(and(
        method ? eq(wasteEvents.method, method) : undefined,
        cursorId ? lt(wasteEvents.id, cursorId) : undefined,
      ))
      .orderBy(desc(wasteEvents.id))
      .limit(fetchLimit)
      .all();

    const hasMore = rows.length > limit;
    const events = rows.slice(0, limit).map(serializeEvent);
    return { events, nextCursor: hasMore ? events[events.length - 1].id : null };
  }

  // "biggest" sort — composite cursor on (amount DESC, id DESC).
  // One extra lookup to find the cursor row's amount, then:
  //   WHERE amount < cursorAmount OR (amount = cursorAmount AND id < cursorId)
  let cursorAmount: number | undefined;
  if (cursorId) {
    const cursorRow = db
      .select({ amount: wasteEvents.amount })
      .from(wasteEvents)
      .where(eq(wasteEvents.id, cursorId))
      .get();
    cursorAmount = cursorRow?.amount;
  }

  const cursorCondition =
    cursorId !== undefined && cursorAmount !== undefined
      ? or(
          lt(wasteEvents.amount, cursorAmount),
          and(eq(wasteEvents.amount, cursorAmount), lt(wasteEvents.id, cursorId))
        )
      : undefined;

  const rows = db
    .select()
    .from(wasteEvents)
    .where(and(
      method ? eq(wasteEvents.method, method) : undefined,
      cursorCondition,
    ))
    .orderBy(desc(wasteEvents.amount), desc(wasteEvents.id))
    .limit(fetchLimit)
    .all();

  const hasMore = rows.length > limit;
  const events = rows.slice(0, limit).map(serializeEvent);
  return { events, nextCursor: hasMore ? events[events.length - 1].id : null };
}

export function getPlatformStats(): PlatformStats {
  const result = db
    .select({
      totalWasted: sum(wasteEvents.amount),
      totalEvents: count(),
    })
    .from(wasteEvents)
    .get();

  const burnersResult = db
    .select({ count: count() })
    .from(
      db
        .selectDistinct({ nickname: wasteEvents.nickname })
        .from(wasteEvents)
        .where(sql`${wasteEvents.nickname} IS NOT NULL`)
        .as("distinct_nicks")
    )
    .get();

  return {
    totalWasted: Number(result?.totalWasted ?? 0),
    totalEvents: result?.totalEvents ?? 0,
    totalBurners: burnersResult?.count ?? 0,
  };
}

export function getLeaderboard(timeframe: "all-time" | "monthly"): LeaderboardEntry[] {
  const baseQuery = timeframe === "monthly"
    ? db
        .select({
          nickname: wasteEvents.nickname,
          totalWasted: sum(wasteEvents.amount).as("total_wasted"),
          wasteCount: count().as("waste_count"),
        })
        .from(wasteEvents)
        .where(
          sql`${wasteEvents.nickname} IS NOT NULL AND ${wasteEvents.createdAt} >= ${Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000)}`
        )
        .groupBy(wasteEvents.nickname)
        .orderBy(sql`total_wasted DESC`)
        .all()
    : db
        .select({
          nickname: wasteEvents.nickname,
          totalWasted: sum(wasteEvents.amount).as("total_wasted"),
          wasteCount: count().as("waste_count"),
        })
        .from(wasteEvents)
        .where(sql`${wasteEvents.nickname} IS NOT NULL`)
        .groupBy(wasteEvents.nickname)
        .orderBy(sql`total_wasted DESC`)
        .all();

  // For each entry, find their top method
  return baseQuery.map((row) => {
    const topMethodRow = db
      .select({
        method: wasteEvents.method,
        total: sum(wasteEvents.amount),
      })
      .from(wasteEvents)
      .where(eq(wasteEvents.nickname, row.nickname!))
      .groupBy(wasteEvents.method)
      .orderBy(sql`${sum(wasteEvents.amount)} DESC`)
      .limit(1)
      .get();

    return {
      nickname: row.nickname!,
      totalWasted: Number(row.totalWasted ?? 0),
      wasteCount: row.wasteCount,
      topMethod: (topMethodRow?.method ?? "burn") as WasteMethod,
    };
  });
}

// ── Chart Data ─────────────────────────────────────────────

export function getWasteOverTime() {
  const rows = db
    .select({
      month: sql<string>`strftime('%Y-%m', datetime(${wasteEvents.createdAt}, 'unixepoch'))`.as("month"),
      amount: sum(wasteEvents.amount).as("amount"),
    })
    .from(wasteEvents)
    .groupBy(sql`month`)
    .orderBy(sql`month ASC`)
    .all();

  return rows.map((r) => {
    const [year, mon] = r.month.split("-");
    const label = new Date(Number(year), Number(mon) - 1).toLocaleDateString("en-US", { month: "short" });
    return { label, amount: Number(r.amount ?? 0) };
  });
}

export function getWasteOverTimePeriod(period: "7d" | "30d" | "3m" | "all") {
  if (period === "all") {
    return getWasteOverTime();
  }

  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const cutoffMs = Date.now() - days * 24 * 60 * 60 * 1000;
  const cutoff = Math.floor(cutoffMs / 1000);

  if (period === "7d" || period === "30d") {
    const rows = db
      .select({
        dateKey: sql<string>`strftime('%Y-%m-%d', datetime(${wasteEvents.createdAt}, 'unixepoch'))`.as("dateKey"),
        amount: sum(wasteEvents.amount).as("amount"),
      })
      .from(wasteEvents)
      .where(sql`${wasteEvents.createdAt} >= ${cutoff}`)
      .groupBy(sql`dateKey`)
      .orderBy(sql`dateKey ASC`)
      .all();

    const dataMap = new Map(rows.map((r) => [r.dateKey, Number(r.amount ?? 0)]));
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(cutoffMs + (i + 1) * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split("T")[0];
      const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return { label, amount: dataMap.get(key) ?? 0 };
    });
  }

  // 3m — weekly buckets
  const rows = db
    .select({
      week: sql<string>`strftime('%Y-%W', datetime(${wasteEvents.createdAt}, 'unixepoch'))`.as("week"),
      amount: sum(wasteEvents.amount).as("amount"),
    })
    .from(wasteEvents)
    .where(sql`${wasteEvents.createdAt} >= ${cutoff}`)
    .groupBy(sql`week`)
    .orderBy(sql`week ASC`)
    .all();

  return rows.map((r, i) => ({
    label: `Wk ${i + 1}`,
    amount: Number(r.amount ?? 0),
  }));
}

export function getWasteByDayOfWeek() {
  const rows = db
    .select({
      day: sql<number>`CAST(strftime('%w', datetime(${wasteEvents.createdAt}, 'unixepoch')) AS INTEGER)`.as("day"),
      total: sum(wasteEvents.amount).as("total"),
      events: count().as("events"),
    })
    .from(wasteEvents)
    .groupBy(sql`day`)
    .orderBy(sql`day ASC`)
    .all();

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dataMap = new Map(rows.map((r) => [r.day, { total: Number(r.total ?? 0), events: r.events }]));

  return dayNames.map((name, i) => ({
    day: name,
    total: dataMap.get(i)?.total ?? 0,
    events: dataMap.get(i)?.events ?? 0,
  }));
}

export function getWasteByMethod() {
  const METHOD_COLORS: Record<string, string> = {
    burn: "#FF4500",
    shred: "#FF6B35",
    flush: "#3B82F6",
    yeet: "#A855F7",
    blackhole: "#6366F1",
    feed: "#10B981",
  };

  const METHOD_LABELS: Record<string, string> = {
    burn: "Burn",
    shred: "Shred",
    flush: "Flush",
    yeet: "Yeet",
    blackhole: "Black Hole",
    feed: "Feed Void",
  };

  const rows = db
    .select({
      method: wasteEvents.method,
      value: sum(wasteEvents.amount).as("value"),
    })
    .from(wasteEvents)
    .groupBy(wasteEvents.method)
    .orderBy(sql`value DESC`)
    .all();

  return rows.map((r) => ({
    method: METHOD_LABELS[r.method] ?? r.method,
    value: Number(r.value ?? 0),
    color: METHOD_COLORS[r.method] ?? "#9C978E",
  }));
}

export function getWasteByAmountTier() {
  const tiers = [
    { label: "₹1–₹10", min: 1, max: 10 },
    { label: "₹10–₹25", min: 10, max: 25 },
    { label: "₹25–₹50", min: 25, max: 50 },
    { label: "₹50–₹100", min: 50, max: 100 },
    { label: "₹100–₹250", min: 100, max: 250 },
    { label: "₹250+", min: 250, max: Infinity },
  ];

  return tiers.map((tier) => {
    const result = db
      .select({ count: count() })
      .from(wasteEvents)
      .where(
        tier.max === Infinity
          ? sql`${wasteEvents.amount} >= ${tier.min}`
          : sql`${wasteEvents.amount} >= ${tier.min} AND ${wasteEvents.amount} < ${tier.max}`
      )
      .get();
    return { tier: tier.label, count: result?.count ?? 0 };
  });
}

export function getHourlyDistribution() {
  const rows = db
    .select({
      hour: sql<number>`CAST(strftime('%H', datetime(${wasteEvents.createdAt}, 'unixepoch')) AS INTEGER)`.as("hour"),
      count: count().as("count"),
    })
    .from(wasteEvents)
    .groupBy(sql`hour`)
    .orderBy(sql`hour ASC`)
    .all();

  // Fill all 24 hours, show every 2 hours for chart labels
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

export function getEventsSince(sinceTimestamp: number): WasteEventRow[] {
  const rows = db
    .select()
    .from(wasteEvents)
    .where(sql`${wasteEvents.createdAt} > ${Math.floor(sinceTimestamp / 1000)}`)
    .orderBy(desc(wasteEvents.createdAt))
    .all();
  return rows.map(serializeEvent);
}

export function getLatestEventTimestamp(): number {
  const row = db
    .select({ ts: wasteEvents.createdAt })
    .from(wasteEvents)
    .orderBy(desc(wasteEvents.createdAt))
    .limit(1)
    .get();
  return row ? row.ts.getTime() : Date.now();
}

// ── Single Event ──────────────────────────────────────────

export function getEventById(id: number) {
  const row = db
    .select()
    .from(wasteEvents)
    .where(eq(wasteEvents.id, id))
    .get();
  return row ? serializeEvent(row) : null;
}

// ── Wall of Waste ──────────────────────────────────────────

export function getTopSingleBurns(limit = 10) {
  const rows = db
    .select()
    .from(wasteEvents)
    .orderBy(desc(wasteEvents.amount))
    .limit(limit)
    .all();

  return rows.map((row, idx) => ({
    rank: idx + 1,
    nickname: row.nickname,
    amount: row.amount,
    method: row.method as WasteMethod,
    when: row.createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }));
}
