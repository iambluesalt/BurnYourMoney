// ============================================================
// DUMMY DATA — Mock data for WasteYourMoney frontend
// ============================================================

import type { WasteMethod } from "./utils";

export interface WasteEvent {
  id: string;
  amount: number;
  method: WasteMethod;
  nickname: string | null;
  createdAt: Date;
}

// Derived type — computed from aggregating WasteEvent, not stored
export interface LeaderboardEntry {
  nickname: string;
  totalWasted: number;
  wasteCount: number;
  topMethod: WasteMethod;
}

// -----------------------------------------------------------
// Waste Events (public feed)
// -----------------------------------------------------------
const now = new Date();

export const wasteEvents: WasteEvent[] = [
  {
    id: "we1",
    amount: 100.0,
    method: "burn",
    nickname: "FlameLord",
    createdAt: new Date(now.getTime() - 2 * 60 * 1000),
  },
  {
    id: "we2",
    amount: 5.0,
    method: "flush",
    nickname: null,
    createdAt: new Date(now.getTime() - 8 * 60 * 1000),
  },
  {
    id: "we3",
    amount: 50.0,
    method: "yeet",
    nickname: "YeetKing",
    createdAt: new Date(now.getTime() - 15 * 60 * 1000),
  },
  {
    id: "we4",
    amount: 20.0,
    method: "shred",
    nickname: "ShredQueen",
    createdAt: new Date(now.getTime() - 23 * 60 * 1000),
  },
  {
    id: "we5",
    amount: 200.0,
    method: "blackhole",
    nickname: "VoidMaster",
    createdAt: new Date(now.getTime() - 41 * 60 * 1000),
  },
  {
    id: "we6",
    amount: 10.0,
    method: "feed",
    nickname: null,
    createdAt: new Date(now.getTime() - 67 * 60 * 1000),
  },
  {
    id: "we7",
    amount: 25.0,
    method: "burn",
    nickname: "FlameLord",
    createdAt: new Date(now.getTime() - 90 * 60 * 1000),
  },
  {
    id: "we8",
    amount: 1.0,
    method: "flush",
    nickname: null,
    createdAt: new Date(now.getTime() - 2.5 * 60 * 60 * 1000),
  },
  {
    id: "we9",
    amount: 75.0,
    method: "yeet",
    nickname: "YeetKing",
    createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
  },
  {
    id: "we10",
    amount: 500.0,
    method: "burn",
    nickname: "FlameLord",
    createdAt: new Date(now.getTime() - 4.2 * 60 * 60 * 1000),
  },
  {
    id: "we11",
    amount: 15.0,
    method: "shred",
    nickname: "ShredQueen",
    createdAt: new Date(now.getTime() - 5.1 * 60 * 60 * 1000),
  },
  {
    id: "we12",
    amount: 250.0,
    method: "blackhole",
    nickname: "VoidMaster",
    createdAt: new Date(now.getTime() - 6.5 * 60 * 60 * 1000),
  },
  {
    id: "we13",
    amount: 8.0,
    method: "feed",
    nickname: null,
    createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
  },
  {
    id: "we14",
    amount: 30.0,
    method: "flush",
    nickname: "FlushGordon",
    createdAt: new Date(now.getTime() - 10 * 60 * 60 * 1000),
  },
  {
    id: "we15",
    amount: 1000.0,
    method: "yeet",
    nickname: "YeetKing",
    createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
  },
  {
    id: "we16",
    amount: 2.0,
    method: "burn",
    nickname: null,
    createdAt: new Date(now.getTime() - 14 * 60 * 60 * 1000),
  },
  {
    id: "we17",
    amount: 60.0,
    method: "shred",
    nickname: "ShredQueen",
    createdAt: new Date(now.getTime() - 18 * 60 * 60 * 1000),
  },
  {
    id: "we18",
    amount: 150.0,
    method: "blackhole",
    nickname: "VoidMaster",
    createdAt: new Date(now.getTime() - 22 * 60 * 60 * 1000),
  },
  {
    id: "we19",
    amount: 35.0,
    method: "burn",
    nickname: "FlameLord",
    createdAt: new Date(now.getTime() - 26 * 60 * 60 * 1000),
  },
  {
    id: "we20",
    amount: 12.0,
    method: "flush",
    nickname: null,
    createdAt: new Date(now.getTime() - 30 * 60 * 60 * 1000),
  },
  // ── Older events to fill out leaderboard totals ──
  {
    id: "we21",
    amount: 4200.0,
    method: "burn",
    nickname: "FlameLord",
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "we22",
    amount: 3500.0,
    method: "burn",
    nickname: "FlameLord",
    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "we23",
    amount: 9560.5,
    method: "burn",
    nickname: "FlameLord",
    createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: "we24",
    amount: 5000.0,
    method: "blackhole",
    nickname: "VoidMaster",
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "we25",
    amount: 6800.0,
    method: "blackhole",
    nickname: "VoidMaster",
    createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: "we26",
    amount: 3000.0,
    method: "yeet",
    nickname: "YeetKing",
    createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: "we27",
    amount: 5745.25,
    method: "yeet",
    nickname: "YeetKing",
    createdAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
  },
  {
    id: "we28",
    amount: 4000.0,
    method: "shred",
    nickname: "ShredQueen",
    createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
  },
  {
    id: "we29",
    amount: 3005.75,
    method: "shred",
    nickname: "ShredQueen",
    createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
  },
  {
    id: "we30",
    amount: 2800.0,
    method: "flush",
    nickname: "FlushGordon",
    createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    id: "we31",
    amount: 2840.0,
    method: "flush",
    nickname: "FlushGordon",
    createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
  },
  {
    id: "we32",
    amount: 2100.0,
    method: "feed",
    nickname: "VoidFeeder",
    createdAt: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000),
  },
  {
    id: "we33",
    amount: 1110.0,
    method: "blackhole",
    nickname: "VoidFeeder",
    createdAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
  },
];

// -----------------------------------------------------------
// Leaderboard (aggregated from events)
// -----------------------------------------------------------
function aggregateLeaderboard(events: WasteEvent[]): LeaderboardEntry[] {
  const map = new Map<string, { total: number; count: number; methods: Record<string, number> }>();

  for (const e of events) {
    if (!e.nickname) continue;
    const existing = map.get(e.nickname) ?? { total: 0, count: 0, methods: {} };
    existing.total += e.amount;
    existing.count += 1;
    existing.methods[e.method] = (existing.methods[e.method] ?? 0) + e.amount;
    map.set(e.nickname, existing);
  }

  return Array.from(map.entries())
    .map(([nickname, data]) => ({
      nickname,
      totalWasted: data.total,
      wasteCount: data.count,
      topMethod: Object.entries(data.methods).sort((a, b) => b[1] - a[1])[0][0] as WasteMethod,
    }))
    .sort((a, b) => b.totalWasted - a.totalWasted);
}

export const leaderboardAllTime = aggregateLeaderboard(wasteEvents);

// Monthly: only events from the last 30 days
const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
export const leaderboardMonthly = aggregateLeaderboard(
  wasteEvents.filter((e) => e.createdAt >= thirtyDaysAgo)
);

// -----------------------------------------------------------
// Chart Data
// -----------------------------------------------------------

export const wasteOverTimeData = [
  { month: "Sep", amount: 4820 },
  { month: "Oct", amount: 7340 },
  { month: "Nov", amount: 11200 },
  { month: "Dec", amount: 18900 },
  { month: "Jan", amount: 14600 },
  { month: "Feb", amount: 22100 },
  { month: "Mar", amount: 31400 },
  { month: "Apr", amount: 18920 },
];

export const wasteByMethodData = [
  { method: "Burn", value: 41200, color: "#FF4500" },
  { method: "Shred", value: 18900, color: "#FF6B35" },
  { method: "Flush", value: 12300, color: "#3B82F6" },
  { method: "Yeet", value: 28700, color: "#A855F7" },
  { method: "Black Hole", value: 35600, color: "#6366F1" },
  { method: "Feed Void", value: 9800, color: "#10B981" },
];

export const wasteByAmountTierData = [
  { tier: "$1–$10", count: 189 },
  { tier: "$10–$25", count: 124 },
  { tier: "$25–$50", count: 87 },
  { tier: "$50–$100", count: 56 },
  { tier: "$100–$250", count: 34 },
  { tier: "$250+", count: 18 },
];

export const hourlyDistributionData = [
  { hour: "12am", count: 12 },
  { hour: "2am", count: 8 },
  { hour: "4am", count: 5 },
  { hour: "6am", count: 3 },
  { hour: "8am", count: 14 },
  { hour: "10am", count: 28 },
  { hour: "12pm", count: 45 },
  { hour: "2pm", count: 52 },
  { hour: "4pm", count: 61 },
  { hour: "6pm", count: 78 },
  { hour: "8pm", count: 94 },
  { hour: "10pm", count: 67 },
];

// -----------------------------------------------------------
// Wall of Waste (biggest single burns)
// -----------------------------------------------------------
export const wallOfWaste = [
  { rank: 1, nickname: "YeetKing", amount: 5000.0, method: "yeet" as WasteMethod, when: "Mar 15, 2025" },
  { rank: 2, nickname: "FlameLord", amount: 2500.0, method: "burn" as WasteMethod, when: "Feb 28, 2025" },
  { rank: 3, nickname: null, amount: 1200.0, method: "blackhole" as WasteMethod, when: "Mar 1, 2025" },
  { rank: 4, nickname: "VoidMaster", amount: 1000.0, method: "blackhole" as WasteMethod, when: "Jan 20, 2025" },
  { rank: 5, nickname: "FlameLord", amount: 750.0, method: "burn" as WasteMethod, when: "Apr 2, 2025" },
];

// -----------------------------------------------------------
// Helpers
// -----------------------------------------------------------
export function getPlatformStats() {
  const totalWasted = wasteEvents.reduce((sum, e) => sum + e.amount, 0);
  return {
    totalWasted,
    totalEvents: wasteEvents.length,
    totalBurners: leaderboardAllTime.length,
  };
}
