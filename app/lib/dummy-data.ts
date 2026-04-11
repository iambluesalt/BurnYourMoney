// ============================================================
// DUMMY DATA — Mock data for BurnYourMoney frontend
// ============================================================

import { getMoneyTypeKey, type MoneyType } from "./utils";

export interface WasteEvent {
  id: string;
  amount: number;
  method: string;
  nickname: string | null;
  message: string | null;
  createdAt: string; // ISO string
}

// Derived type — computed from aggregating WasteEvent, not stored
export interface LeaderboardEntry {
  nickname: string;
  totalWasted: number;
  wasteCount: number;
  tier: MoneyType;
}

// -----------------------------------------------------------
// Waste Events (public feed)
// -----------------------------------------------------------
const NOW = new Date();
function iso(ms: number) {
  return new Date(NOW.getTime() - ms).toISOString();
}

export const wasteEvents: WasteEvent[] = [
  { id: "we1",  amount: 100.0,   method: "note",      nickname: "FlameLord",   message: null,                        createdAt: iso(2 * 60 * 1000) },
  { id: "we2",  amount: 5.0,     method: "coin",      nickname: null,          message: null,                        createdAt: iso(8 * 60 * 1000) },
  { id: "we3",  amount: 50.0,    method: "coin",      nickname: "YeetKing",    message: "YOLO",                      createdAt: iso(15 * 60 * 1000) },
  { id: "we4",  amount: 20.0,    method: "coin",      nickname: "ShredQueen",  message: null,                        createdAt: iso(23 * 60 * 1000) },
  { id: "we5",  amount: 200.0,   method: "note",      nickname: "VoidMaster",  message: "Into the abyss",            createdAt: iso(41 * 60 * 1000) },
  { id: "we6",  amount: 10.0,    method: "coin",      nickname: null,          message: null,                        createdAt: iso(67 * 60 * 1000) },
  { id: "we7",  amount: 25.0,    method: "coin",      nickname: "FlameLord",   message: null,                        createdAt: iso(90 * 60 * 1000) },
  { id: "we8",  amount: 1.0,     method: "coin",      nickname: null,          message: null,                        createdAt: iso(2.5 * 60 * 60 * 1000) },
  { id: "we9",  amount: 75.0,    method: "coin",      nickname: "YeetKing",    message: null,                        createdAt: iso(3 * 60 * 60 * 1000) },
  { id: "we10", amount: 500.0,   method: "splash",    nickname: "FlameLord",   message: "This is fine.",             createdAt: iso(4.2 * 60 * 60 * 1000) },
  { id: "we11", amount: 15.0,    method: "coin",      nickname: "ShredQueen",  message: null,                        createdAt: iso(5.1 * 60 * 60 * 1000) },
  { id: "we12", amount: 250.0,   method: "note",      nickname: "VoidMaster",  message: null,                        createdAt: iso(6.5 * 60 * 60 * 1000) },
  { id: "we13", amount: 8.0,     method: "coin",      nickname: null,          message: null,                        createdAt: iso(8 * 60 * 60 * 1000) },
  { id: "we14", amount: 30.0,    method: "coin",      nickname: "FlushGordon", message: null,                        createdAt: iso(10 * 60 * 60 * 1000) },
  { id: "we15", amount: 1000.0,  method: "bag",       nickname: "YeetKing",    message: "No ragrets",                createdAt: iso(12 * 60 * 60 * 1000) },
  { id: "we16", amount: 2.0,     method: "coin",      nickname: null,          message: null,                        createdAt: iso(14 * 60 * 60 * 1000) },
  { id: "we17", amount: 60.0,    method: "coin",      nickname: "ShredQueen",  message: null,                        createdAt: iso(18 * 60 * 60 * 1000) },
  { id: "we18", amount: 150.0,   method: "note",      nickname: "VoidMaster",  message: null,                        createdAt: iso(22 * 60 * 60 * 1000) },
  { id: "we19", amount: 35.0,    method: "coin",      nickname: "FlameLord",   message: null,                        createdAt: iso(26 * 60 * 60 * 1000) },
  { id: "we20", amount: 12.0,    method: "coin",      nickname: null,          message: null,                        createdAt: iso(30 * 60 * 60 * 1000) },
  // ── Older events to fill out leaderboard totals ──
  { id: "we21", amount: 4200.0,  method: "fire",      nickname: "FlameLord",   message: null,                        createdAt: iso(3 * 24 * 60 * 60 * 1000) },
  { id: "we22", amount: 3500.0,  method: "fire",      nickname: "FlameLord",   message: null,                        createdAt: iso(7 * 24 * 60 * 60 * 1000) },
  { id: "we23", amount: 9560.5,  method: "fire",      nickname: "FlameLord",   message: "I regret nothing",          createdAt: iso(14 * 24 * 60 * 60 * 1000) },
  { id: "we24", amount: 5000.0,  method: "fire",      nickname: "VoidMaster",  message: null,                        createdAt: iso(5 * 24 * 60 * 60 * 1000) },
  { id: "we25", amount: 6800.0,  method: "fire",      nickname: "VoidMaster",  message: "Void go brrrr",             createdAt: iso(10 * 24 * 60 * 60 * 1000) },
  { id: "we26", amount: 3000.0,  method: "bag",       nickname: "YeetKing",    message: null,                        createdAt: iso(4 * 24 * 60 * 60 * 1000) },
  { id: "we27", amount: 5745.25, method: "fire",      nickname: "YeetKing",    message: null,                        createdAt: iso(9 * 24 * 60 * 60 * 1000) },
  { id: "we28", amount: 4000.0,  method: "fire",      nickname: "ShredQueen",  message: null,                        createdAt: iso(6 * 24 * 60 * 60 * 1000) },
  { id: "we29", amount: 3005.75, method: "fire",      nickname: "ShredQueen",  message: null,                        createdAt: iso(12 * 24 * 60 * 60 * 1000) },
  { id: "we30", amount: 2800.0,  method: "bag",       nickname: "FlushGordon", message: null,                        createdAt: iso(8 * 24 * 60 * 60 * 1000) },
  { id: "we31", amount: 2840.0,  method: "bag",       nickname: "FlushGordon", message: "Down the drain",            createdAt: iso(15 * 24 * 60 * 60 * 1000) },
  { id: "we32", amount: 2100.0,  method: "bag",       nickname: "VoidFeeder",  message: null,                        createdAt: iso(11 * 24 * 60 * 60 * 1000) },
  { id: "we33", amount: 1110.0,  method: "bag",       nickname: "VoidFeeder",  message: null,                        createdAt: iso(18 * 24 * 60 * 60 * 1000) },
];

// -----------------------------------------------------------
// Leaderboard (aggregated from events)
// -----------------------------------------------------------
function aggregateLeaderboard(events: WasteEvent[]): LeaderboardEntry[] {
  const map = new Map<string, { total: number; count: number }>();

  for (const e of events) {
    if (!e.nickname) continue;
    const existing = map.get(e.nickname) ?? { total: 0, count: 0 };
    existing.total += e.amount;
    existing.count += 1;
    map.set(e.nickname, existing);
  }

  return Array.from(map.entries())
    .map(([nickname, data]) => ({
      nickname,
      totalWasted: data.total,
      wasteCount: data.count,
      tier: getMoneyTypeKey(data.total),
    }))
    .sort((a, b) => b.totalWasted - a.totalWasted);
}

export const leaderboardAllTime = aggregateLeaderboard(wasteEvents);

// Monthly: only events from the last 30 days (ISO string comparison works lexicographically)
const thirtyDaysAgo = iso(30 * 24 * 60 * 60 * 1000);
export const leaderboardMonthly = aggregateLeaderboard(
  wasteEvents.filter((e) => e.createdAt >= thirtyDaysAgo)
);

// -----------------------------------------------------------
// Top Single Burns (wall of shame)
// -----------------------------------------------------------
export interface TopBurn {
  rank: number;
  id: string;
  nickname: string | null;
  message: string | null;
  amount: number;
  method: string;
  when: string;
}

export function getTopSingleBurns(limit = 10): TopBurn[] {
  return [...wasteEvents]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
    .map((e, idx) => ({
      rank: idx + 1,
      id: e.id,
      nickname: e.nickname,
      message: e.message,
      amount: e.amount,
      method: e.method,
      when: new Date(e.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));
}

// -----------------------------------------------------------
// Chart Data
// -----------------------------------------------------------

export const wasteOverTimeData = [
  { label: "Sep", amount: 4820 },
  { label: "Oct", amount: 7340 },
  { label: "Nov", amount: 11200 },
  { label: "Dec", amount: 18900 },
  { label: "Jan", amount: 14600 },
  { label: "Feb", amount: 22100 },
  { label: "Mar", amount: 31400 },
  { label: "Apr", amount: 18920 },
];

export const wasteByMethodData = [
  { type: "Bonfire",      value: 41200, color: "#FF4500" },
  { type: "Paper Trail",  value: 18900, color: "#22C55E" },
  { type: "Cash Splash",  value: 12300, color: "#3B82F6" },
  { type: "Money Bag",    value: 28700, color: "#F59E0B" },
  { type: "Diamond Burn", value: 35600, color: "#A855F7" },
  { type: "Royal Waste",  value: 9800,  color: "#FFB800" },
];

export const wasteByAmountTierData = [
  { tier: "₹1–₹10",    count: 189 },
  { tier: "₹10–₹25",   count: 124 },
  { tier: "₹25–₹50",   count: 87 },
  { tier: "₹50–₹100",  count: 56 },
  { tier: "₹100–₹250", count: 34 },
  { tier: "₹250+",      count: 18 },
];

export const wasteByDayOfWeekData = [
  { day: "Sun", total: 8200,  events: 12 },
  { day: "Mon", total: 5400,  events: 8  },
  { day: "Tue", total: 6100,  events: 9  },
  { day: "Wed", total: 9800,  events: 14 },
  { day: "Thu", total: 7300,  events: 11 },
  { day: "Fri", total: 14200, events: 21 },
  { day: "Sat", total: 18700, events: 27 },
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
