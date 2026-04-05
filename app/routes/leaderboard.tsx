import { useState } from "react";
import { Trophy } from "lucide-react";
import { leaderboardAllTime, leaderboardMonthly } from "~/lib/dummy-data";
import { formatCurrency, formatCompactCurrency, getMethodInfo, cn } from "~/lib/utils";
import type { WasteMethod } from "~/lib/utils";

type TimeFrame = "all-time" | "monthly";

export default function Leaderboard() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("all-time");

  const entries = timeFrame === "all-time" ? leaderboardAllTime : leaderboardMonthly;
  const totalWasted = entries.reduce((sum, e) => sum + e.totalWasted, 0);

  return (
    <div className="min-h-screen">
      {/* ─── HEADER ─── */}
      <div className="border-b border-border bg-surface/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 border border-gold/20">
              <Trophy className="h-5 w-5 text-gold" />
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold">
              Leaderboard
            </h1>
          </div>
          <p className="text-text-muted text-sm ml-[52px]">
            {timeFrame === "all-time"
              ? "All time rankings — who has burned the most"
              : "This month's rankings — who is burning hottest right now"}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* ─── TIMEFRAME TABS ─── */}
        <div className="flex gap-2 mb-8">
          {([
            ["all-time", "All Time"],
            ["monthly", "This Month"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTimeFrame(id)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-bold transition-all border",
                timeFrame === id
                  ? "bg-gold/10 border-gold/30 text-gold"
                  : "bg-surface border-border text-text-muted hover:text-text"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ─── TOP 3 HIGHLIGHT ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 stagger-children">
          {entries.slice(0, 3).map((entry, idx) => {
            const method = getMethodInfo(entry.topMethod);
            const medals = ["🥇", "🥈", "🥉"];
            const tierColors = ["#FFB800", "#9CA3AF", "#CD7F32"];
            return (
              <div
                key={entry.nickname}
                className={cn(
                  "relative rounded-2xl border p-6 overflow-hidden",
                  idx === 0
                    ? "border-gold/40 bg-gold/5"
                    : "border-border bg-surface"
                )}
              >
                {/* Rank badge */}
                <div
                  className="absolute top-4 right-4 text-2xl"
                  style={{ filter: idx === 0 ? "drop-shadow(0 0 8px #FFB80060)" : "none" }}
                >
                  {medals[idx]}
                </div>

                <div className="flex items-start gap-4">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl flex-shrink-0"
                    style={{
                      backgroundColor: `${tierColors[idx]}15`,
                      border: `1px solid ${tierColors[idx]}30`,
                    }}
                  >
                    {entry.nickname[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-text-dim mb-0.5">
                      #{idx + 1} · {entry.wasteCount} burns
                    </div>
                    <div className="font-[family-name:var(--font-display)] text-xl font-extrabold truncate">
                      {entry.nickname}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-sm">{method.icon}</span>
                      <span className="text-xs text-text-muted">
                        {entry.wasteCount} waste events
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="font-[family-name:var(--font-display)] text-2xl font-extrabold fire-glow">
                    {formatCurrency(entry.totalWasted)}
                  </div>
                  <div className="text-xs text-text-dim mt-0.5">total burned</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── FULL TABLE ─── */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-elevated">
                <th className="text-left text-xs font-bold text-text-dim uppercase tracking-widest px-6 py-4">#</th>
                <th className="text-left text-xs font-bold text-text-dim uppercase tracking-widest px-6 py-4">Waster</th>
                <th className="text-right text-xs font-bold text-text-dim uppercase tracking-widest px-6 py-4">Total Burned</th>
                <th className="text-right text-xs font-bold text-text-dim uppercase tracking-widest px-6 py-4">Events</th>
                <th className="text-right text-xs font-bold text-text-dim uppercase tracking-widest px-6 py-4">Top Method</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => {
                const method = getMethodInfo(entry.topMethod);
                return (
                  <tr
                    key={entry.nickname}
                    className={cn(
                      "border-b border-border/50 last:border-0 transition-colors",
                      idx < 3 ? "hover:bg-surface-hover" : "hover:bg-surface-hover"
                    )}
                  >
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold",
                          idx === 0
                            ? "bg-gold/10 text-gold"
                            : idx === 1
                            ? "bg-gray-500/10 text-gray-400"
                            : idx === 2
                            ? "bg-orange-700/10 text-orange-600"
                            : "bg-surface-elevated text-text-dim"
                        )}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold flex-shrink-0"
                          style={{ backgroundColor: `${method.color}12` }}
                        >
                          {entry.nickname[0].toUpperCase()}
                        </div>
                        <span className="font-semibold text-sm">
                          {entry.nickname}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-[family-name:var(--font-display)] font-bold fire-glow">
                        {formatCurrency(entry.totalWasted)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-text-muted">
                      {entry.wasteCount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
                        style={{ color: method.color, backgroundColor: `${method.color}12` }}
                      >
                        {method.icon} {method.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ─── FOOTNOTE ─── */}
        <div className="mt-6 text-center text-sm text-text-dim">
          <p>
            Total on this board:{" "}
            <span className="font-bold fire-glow">{formatCompactCurrency(totalWasted)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
