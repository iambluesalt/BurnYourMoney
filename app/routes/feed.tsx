import { useState } from "react";
import { Flame, Clock, ArrowUpDown } from "lucide-react";
import { wasteEvents, getPlatformStats } from "~/lib/dummy-data";
import { formatCurrency, formatCompactCurrency, timeAgo, getMethodInfo, WASTE_METHODS, type WasteMethod } from "~/lib/utils";
import { cn } from "~/lib/utils";

type SortOption = "newest" | "biggest" | "method";

export default function Feed() {
  const [methodFilter, setMethodFilter] = useState<WasteMethod | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const stats = getPlatformStats();

  let filtered = [...wasteEvents];

  if (methodFilter !== "all") {
    filtered = filtered.filter((e) => e.method === methodFilter);
  }

  if (sortBy === "biggest") {
    filtered.sort((a, b) => b.amount - a.amount);
  } else {
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  return (
    <div className="min-h-screen">
      {/* ─── HEADER ─── */}
      <div className="border-b border-border bg-surface/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <Flame className="h-5 w-5 text-primary" />
                </div>
                <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold">
                  Live Waste Feed
                </h1>
              </div>
              <p className="text-text-muted text-sm">
                Watch money disappear in real-time.{" "}
                <span className="font-semibold fire-glow">
                  {formatCompactCurrency(stats.totalWasted)}
                </span>{" "}
                total incinerated.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-dim">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Live
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* ─── FILTERS ─── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Method filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setMethodFilter("all")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border",
                methodFilter === "all"
                  ? "bg-primary text-background border-primary"
                  : "bg-surface border-border text-text-muted hover:text-text"
              )}
            >
              All
            </button>
            {Object.entries(WASTE_METHODS).map(([key, method]) => (
              <button
                key={key}
                onClick={() => setMethodFilter(key as WasteMethod)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border",
                  methodFilter === key
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "bg-surface border-border text-text-muted hover:text-text"
                )}
              >
                <span>{method.icon}</span>
                <span>{method.label}</span>
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 sm:ml-auto">
            <ArrowUpDown className="h-4 w-4 text-text-dim flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text outline-none focus:border-primary transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="biggest">Biggest Amount</option>
            </select>
          </div>
        </div>

        {/* ─── FEED ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
          {filtered.map((event) => {
            const method = getMethodInfo(event.method);
            return (
              <div
                key={event.id}
                className="group rounded-xl border border-border bg-surface p-5 card-ember"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-lg text-xl"
                    style={{ backgroundColor: `${method.color}15` }}
                  >
                    {method.icon}
                  </div>
                  <span className="flex items-center gap-1 text-xs text-text-dim">
                    <Clock className="h-3 w-3" />
                    {timeAgo(event.createdAt)}
                  </span>
                </div>

                {/* Amount */}
                <div className="font-[family-name:var(--font-display)] text-3xl font-extrabold fire-glow mb-2">
                  {formatCurrency(event.amount)}
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">
                    {method.verb} by{" "}
                    <span className="font-semibold text-text">
                      {event.nickname ?? "Anonymous"}
                    </span>
                  </span>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ color: method.color, backgroundColor: `${method.color}12` }}
                  >
                    {method.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔥</div>
            <p className="text-text-muted text-lg">No waste events match your filter.</p>
            <p className="text-text-dim text-sm mt-1">Be the first to burn some money.</p>
          </div>
        )}
      </div>
    </div>
  );
}
