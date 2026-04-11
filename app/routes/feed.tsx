import { useState, useMemo } from "react";
import { Flame, Clock, ArrowUpDown, LayoutGrid, Table2, ChevronDown } from "lucide-react";
import { Link, useLoaderData } from "react-router";
import { BurnDetailModal, type BurnDetail } from "~/components/burn-detail-modal";
import { getAllEvents, getPlatformStats } from "~/lib/queries.server";
import { formatCurrency, formatCompactCurrency, timeAgo, getMoneyType, MONEY_TYPES, type MoneyType, cn } from "~/lib/utils";

export async function loader() {
  const [events, stats] = await Promise.all([
    getAllEvents(),
    getPlatformStats(),
  ]);
  return { events, stats };
}

export function meta() {
  return [
    { title: "Live Waste Feed — BurnYourMoney" },
    { name: "description", content: "Watch money disappear in real-time. From loose change to royal fortunes — live as it happens." },
    { property: "og:title", content: "Live Waste Feed — BurnYourMoney" },
    { property: "og:description", content: "Watch money disappear in real-time." },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "BurnYourMoney" },
    { name: "twitter:card", content: "summary" },
  ];
}

type SortOption = "newest" | "biggest";
type ViewMode = "grid" | "table";

const PAGE_SIZE = 24;

export default function Feed() {
  const { events: allEvents, stats } = useLoaderData<typeof loader>();
  const [tierFilter, setTierFilter] = useState<MoneyType | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [shown, setShown] = useState(PAGE_SIZE);
  const [selectedBurn, setSelectedBurn] = useState<BurnDetail | null>(null);

  const filtered = useMemo(() => {
    let result = [...allEvents];

    if (tierFilter !== "all") {
      const tier = MONEY_TYPES[tierFilter];
      result = result.filter((e) => e.amount >= tier.min && e.amount <= tier.max);
    }

    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      result.sort((a, b) => b.amount - a.amount);
    }

    return result;
  }, [allEvents, tierFilter, sortBy]);

  const events = filtered.slice(0, shown);
  const hasMore = shown < filtered.length;

  function handleFilterChange(f: MoneyType | "all") {
    setTierFilter(f);
    setShown(PAGE_SIZE);
  }

  function handleSortChange(s: SortOption) {
    setSortBy(s);
    setShown(PAGE_SIZE);
  }

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
            <Link to="/leaderboard" className="px-3 py-2 text-sm font-medium text-text-muted hover:text-text transition-colors">Leaderboard</Link>
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
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* ─── FILTERS ─── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => handleFilterChange("all")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border",
                tierFilter === "all"
                  ? "bg-primary text-background border-primary"
                  : "bg-surface border-border text-text-muted hover:text-text"
              )}
            >
              All
            </button>
            {Object.entries(MONEY_TYPES).map(([key, tier]) => (
              <button
                key={key}
                onClick={() => handleFilterChange(key as MoneyType)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border",
                  tierFilter === key
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "bg-surface border-border text-text-muted hover:text-text"
                )}
              >
                <span>{tier.icon}</span>
                <span>{tier.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:ml-auto">
            <ArrowUpDown className="h-4 w-4 text-text-dim flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text outline-none focus:border-primary transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="biggest">Biggest Amount</option>
            </select>

            <div className="flex items-center rounded-lg border border-border bg-surface overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                title="Grid view"
                className={cn(
                  "flex items-center justify-center w-8 h-8 transition-all",
                  viewMode === "grid" ? "bg-primary/10 text-primary" : "text-text-dim hover:text-text"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <div className="w-px h-4 bg-border" />
              <button
                onClick={() => setViewMode("table")}
                title="Table view"
                className={cn(
                  "flex items-center justify-center w-8 h-8 transition-all",
                  viewMode === "table" ? "bg-primary/10 text-primary" : "text-text-dim hover:text-text"
                )}
              >
                <Table2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── GRID VIEW ─── */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {events.map((event) => {
              const tier = getMoneyType(event.amount);
              return (
                <button
                  key={event.id}
                  onClick={() => setSelectedBurn({ amount: event.amount, method: event.method, nickname: event.nickname, message: event.message, createdAt: event.createdAt })}
                  className="group relative overflow-hidden rounded-xl border border-border bg-surface p-5 card-ember text-left cursor-pointer hover:border-primary/30 transition-colors"
                >
                  <div className="flex justify-start mb-3">
                    <span className="flex items-center gap-1 text-xs text-text-dim">
                      <Clock className="h-3 w-3" />
                      {timeAgo(new Date(event.createdAt))}
                    </span>
                  </div>
                  <div className="font-[family-name:var(--font-display)] text-4xl font-extrabold fire-glow mb-2">
                    {formatCurrency(event.amount)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">
                      {tier.verb} by{" "}
                      <span className="font-semibold text-text">
                        {event.nickname ?? "Anonymous"}
                      </span>
                    </span>
                  </div>
                  <span className="absolute -bottom-5 -right-4 text-[90px] opacity-[0.12] pointer-events-none select-none transition-transform duration-300 group-hover:scale-110 group-hover:opacity-[0.2]" aria-hidden="true">
                    {tier.icon}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ─── TABLE VIEW ─── */}
        {viewMode === "table" && events.length > 0 && (
          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/80">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-text-dim uppercase tracking-wider">Type</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-text-dim uppercase tracking-wider">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-text-dim uppercase tracking-wider hidden sm:table-cell">By</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-text-dim uppercase tracking-wider hidden md:table-cell">Message</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-text-dim uppercase tracking-wider">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {events.map((event) => {
                  const tier = getMoneyType(event.amount);
                  return (
                    <tr
                      key={event.id}
                      onClick={() => setSelectedBurn({ amount: event.amount, method: event.method, nickname: event.nickname, message: event.message, createdAt: event.createdAt })}
                      className="group hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg text-base flex-shrink-0" style={{ backgroundColor: `${tier.color}15` }}>
                            {tier.icon}
                          </span>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full hidden xs:inline-flex" style={{ color: tier.color, backgroundColor: `${tier.color}12` }}>
                            {tier.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="font-[family-name:var(--font-display)] font-extrabold fire-glow text-base">
                          {formatCurrency(event.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="text-xs text-text-muted">
                          {tier.verb} by{" "}
                          <span className="font-semibold text-text">{event.nickname ?? "Anonymous"}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right hidden md:table-cell">
                        {event.message ? (
                          <span className="text-xs text-text-muted italic truncate max-w-[180px] inline-block align-middle">
                            "{event.message}"
                          </span>
                        ) : (
                          <span className="text-xs text-text-dim">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="flex items-center justify-end gap-1 text-xs text-text-dim">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          {timeAgo(new Date(event.createdAt))}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── EMPTY STATE ─── */}
        {events.length === 0 && (
          <div className="text-center py-20">
            {tierFilter !== "all" ? (
              <>
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-text-muted text-lg">Nobody's wasting at this tier. Yet.</p>
                <p className="text-text-dim text-sm mt-1">Be the first cautionary tale in this category.</p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">🕳️</div>
                <p className="text-text-muted text-lg">The feed is suspiciously empty.</p>
                <p className="text-text-dim text-sm mt-1">Not a single rupee wasted. This is either very early days or humanity briefly came to its senses.</p>
              </>
            )}
          </div>
        )}

        {/* ─── LOAD MORE ─── */}
        {events.length > 0 && (
          <div className="flex flex-col items-center gap-3 mt-10">
            <p className="text-xs text-text-dim">
              Showing{" "}
              <span className="font-semibold text-text">{events.length}</span>{" "}
              {hasMore ? (
                <>events · <span className="text-text-muted">more available</span></>
              ) : (
                <>events · <span className="text-text-muted">all caught up</span></>
              )}
            </p>
            {hasMore && (
              <button
                onClick={() => setShown((n) => n + PAGE_SIZE)}
                className="flex items-center gap-2 px-5 py-2 rounded-lg border border-border bg-surface text-sm font-medium text-text hover:border-primary hover:text-primary transition-all"
              >
                <ChevronDown className="h-4 w-4" />
                Load More
              </button>
            )}
          </div>
        )}
      </div>

      <BurnDetailModal burn={selectedBurn} onClose={() => setSelectedBurn(null)} />
    </div>
  );
}
