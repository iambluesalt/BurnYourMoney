import { useState } from "react";
import { Trophy, Flame } from "lucide-react";
import { Link, useLoaderData } from "react-router";
import { BurnDetailModal, type BurnDetail } from "~/components/burn-detail-modal";
import { getLeaderboard, getTopSingleBurns } from "~/lib/queries.server";
import { formatCurrency, formatCompactCurrency, getMoneyType, cn } from "~/lib/utils";

export async function loader() {
  const [leaderboardAllTime, leaderboardMonthly, biggestBurns] = await Promise.all([
    getLeaderboard("all-time"),
    getLeaderboard("monthly"),
    getTopSingleBurns(10),
  ]);
  return { leaderboardAllTime, leaderboardMonthly, biggestBurns };
}

export function meta() {
  return [
    { title: "Leaderboard — BurnYourMoney" },
    { name: "description", content: "Who has burned the most money? See the all-time and monthly rankings of the biggest wasters." },
    { property: "og:title", content: "Leaderboard — BurnYourMoney" },
    { property: "og:description", content: "Who has burned the most money? See the rankings." },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "BurnYourMoney" },
    { name: "twitter:card", content: "summary" },
  ];
}

type TimeFrame = "all-time" | "monthly" | "biggest";

export default function Leaderboard() {
  const { leaderboardAllTime, leaderboardMonthly, biggestBurns } = useLoaderData<typeof loader>();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("all-time");
  const [selectedBurn, setSelectedBurn] = useState<BurnDetail | null>(null);

  const entries = timeFrame === "all-time" ? leaderboardAllTime : leaderboardMonthly;
  const totalWasted = timeFrame !== "biggest"
    ? entries.reduce((sum, e) => sum + e.totalWasted, 0)
    : biggestBurns.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="min-h-screen">
      {/* ─── NAV ─── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link to="/" className="group">
            <span className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight">
              <span className="text-primary">.</span>burn<span className="text-primary">your</span>money
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link to="/feed" className="px-3 py-2 text-sm font-medium text-text-muted hover:text-text transition-colors">Live Feed</Link>
            <Link to="/analytics" className="px-3 py-2 text-sm font-medium text-text-muted hover:text-text transition-colors">Analytics</Link>
            <Link to="/my-burns" className="px-3 py-2 text-sm font-medium text-text-muted hover:text-text transition-colors">My Burns</Link>
            <Link
              to="/burn"
              className="ml-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-sm font-bold text-background hover:bg-primary-hover transition-all hover:shadow-lg hover:shadow-primary-glow"
            >
              <Flame className="h-4 w-4" />
              Burn
            </Link>
          </div>
        </div>
      </nav>

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
              : timeFrame === "monthly"
              ? "This month's rankings — who is burning hottest right now"
              : "The biggest single burns of all time — financial disasters immortalized"}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* ─── TIMEFRAME TABS ─── */}
        <div className="flex gap-2 mb-8">
          {([
            ["all-time", "All Time"],
            ["monthly", "This Month"],
            ["biggest", "Biggest Burns"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTimeFrame(id)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-bold transition-all border",
                timeFrame === id
                  ? id === "biggest"
                    ? "bg-danger/10 border-danger/30 text-danger"
                    : "bg-gold/10 border-gold/30 text-gold"
                  : "bg-surface border-border text-text-muted hover:text-text"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {timeFrame === "biggest" ? (
          <>
            {/* ─── BIGGEST BURNS ─── */}
            {biggestBurns.length === 0 && (
              <div className="rounded-2xl border border-border bg-surface p-16 text-center">
                <div className="text-5xl mb-4">🏆</div>
                <p className="text-text-muted font-semibold mb-1">No big burns yet.</p>
                <p className="text-text-dim text-sm">The throne is empty. Embarrassingly so.</p>
              </div>
            )}
            {biggestBurns[0] && (() => {
              const biggest = biggestBurns[0];
              const tier = getMoneyType(biggest.amount);
              return (
                <button
                  onClick={() => setSelectedBurn(biggest)}
                  className="relative w-full rounded-3xl border-2 border-danger/30 bg-gradient-to-b from-danger/8 to-transparent p-8 sm:p-12 mb-8 overflow-hidden hover:border-primary/40 transition-colors"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-danger/5 rounded-full blur-[80px] pointer-events-none" />
                  <div className="relative text-center">
                    <div className="text-6xl mb-4 drop-shadow-lg">🏆</div>
                    <div className="text-xs font-bold text-danger uppercase tracking-widest mb-4">
                      #1 Biggest Single Burn
                    </div>
                    <div className="font-[family-name:var(--font-display)] text-6xl sm:text-8xl font-extrabold fire-glow-intense mb-2">
                      {formatCurrency(biggest.amount)}
                    </div>
                    <div className="flex items-center justify-center gap-3 mt-6">
                      <span
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold"
                        style={{ color: tier.color, backgroundColor: `${tier.color}15` }}
                      >
                        {tier.icon} {tier.label}
                      </span>
                      <span className="text-text-dim text-sm">by</span>
                      <span className="font-bold text-lg">{biggest.nickname ?? "Anonymous"}</span>
                    </div>
                    <div className="text-text-dim text-sm mt-2">{biggest.when}</div>
                  </div>
                </button>
              );
            })()}

            <div className="space-y-4">
              {biggestBurns.slice(1).map((waste) => {
                const tier = getMoneyType(waste.amount);
                return (
                  <button
                    key={waste.rank}
                    onClick={() => setSelectedBurn(waste)}
                    className="group relative overflow-hidden w-full rounded-2xl border border-border bg-surface p-6 flex flex-col sm:flex-row sm:items-center gap-5 card-ember text-left hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold flex-shrink-0",
                          waste.rank === 2 ? "bg-gray-500/10 text-gray-400" : "bg-orange-700/10 text-orange-700"
                        )}
                      >
                        #{waste.rank}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base">{waste.nickname ?? "Anonymous"}</div>
                      <div className="text-xs text-text-dim mt-0.5">{waste.when} · {tier.label}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-[family-name:var(--font-display)] text-2xl font-extrabold fire-glow">
                        {formatCurrency(waste.amount)}
                      </div>
                    </div>
                    <span className="absolute -bottom-5 -right-4 text-[90px] opacity-[0.10] pointer-events-none select-none transition-transform duration-300 group-hover:scale-110 group-hover:opacity-[0.18] -rotate-12" aria-hidden="true">
                      {tier.icon}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 text-center text-sm text-text-dim">
              <p>
                These are single transactions — every rupee paid with zero expectation of return.
              </p>
            </div>
          </>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-16 text-center">
            <div className="text-5xl mb-4">👀</div>
            <p className="text-text-muted font-semibold mb-1">
              {timeFrame === "monthly" ? "Nobody named this month." : "The board is empty."}
            </p>
            <p className="text-text-dim text-sm">
              {timeFrame === "monthly"
                ? "Anonymous burns don't count. Use a nickname, coward."
                : "No named burners yet. Everyone's too embarrassed to claim their waste."}
            </p>
          </div>
        ) : (
          <>
            {/* ─── TOP 3 HIGHLIGHT ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {entries.slice(0, 3).map((entry, idx) => {
                const tier = getMoneyType(entry.totalWasted);
                const medals = ["🥇", "🥈", "🥉"];
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
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-[family-name:var(--font-display)] text-3xl font-extrabold truncate">
                          {entry.nickname}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-text-muted">
                            {entry.wasteCount} waste events
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4">
                      <div className="font-[family-name:var(--font-display)] text-2xl font-extrabold fire-glow">
                        {formatCurrency(entry.totalWasted)}
                      </div>
                      <div className="text-xs text-text-dim mt-0.5">total burned</div>
                    </div>
                    <span
                      className="absolute -bottom-5 -right-4 text-[90px] opacity-[0.30] pointer-events-none select-none -rotate-12"
                      style={{
                        filter: idx === 0
                          ? "drop-shadow(0 0 16px #FFB800) drop-shadow(0 0 32px #FFB80080)"
                          : idx === 1
                          ? "drop-shadow(0 0 12px #9CA3AF) drop-shadow(0 0 24px #9CA3AF60)"
                          : "drop-shadow(0 0 12px #CD7F32) drop-shadow(0 0 24px #CD7F3260)",
                      }}
                      aria-hidden="true"
                    >
                      {medals[idx]}
                    </span>
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
                    <th className="text-right text-xs font-bold text-text-dim uppercase tracking-widest px-6 py-4">Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, idx) => {
                    const tier = getMoneyType(entry.totalWasted);
                    return (
                      <tr
                        key={entry.nickname}
                        className="border-b border-border/50 last:border-0 transition-colors hover:bg-surface-hover"
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
                              style={{ backgroundColor: `${tier.color}12` }}
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
                            style={{ color: tier.color, backgroundColor: `${tier.color}12` }}
                          >
                            {tier.icon} {tier.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ─── FOOTNOTE ─── */}
        <div className="mt-6 text-center text-sm text-text-dim">
          <p>
            Total on this board:{" "}
            <span className="font-bold fire-glow">{formatCompactCurrency(totalWasted)}</span>
          </p>
        </div>
      </div>

      <BurnDetailModal burn={selectedBurn} onClose={() => setSelectedBurn(null)} />
    </div>
  );
}
