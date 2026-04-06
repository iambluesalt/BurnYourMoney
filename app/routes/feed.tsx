import { useState, useEffect, useRef } from "react";
import { Flame, Clock, ArrowUpDown, LayoutGrid, Table2, ChevronDown, Loader2 } from "lucide-react";
import { useFetcher, Link } from "react-router";
import { getEventsPaginated, getPlatformStats } from "~/lib/queries.server";
import type { WasteEventRow } from "~/lib/queries.server";
import { formatCurrency, formatCompactCurrency, timeAgo, getMethodInfo, WASTE_METHODS, type WasteMethod } from "~/lib/utils";
import { cn } from "~/lib/utils";
import { useLiveData } from "~/lib/use-live-data";
import type { Route } from "./+types/feed";

export function meta() {
  return [
    { title: "Live Waste Feed — WasteYourMoney" },
    { name: "description", content: "Watch money disappear in real-time. Every burn, shred, flush, and yeet — live as it happens." },
    { property: "og:title", content: "Live Waste Feed — WasteYourMoney" },
    { property: "og:description", content: "Watch money disappear in real-time." },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "WasteYourMoney" },
    { name: "twitter:card", content: "summary" },
  ];
}

type SortOption = "newest" | "biggest";
type ViewMode = "grid" | "table";

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const cursorId = url.searchParams.get("cursor")
    ? Number(url.searchParams.get("cursor"))
    : undefined;
  const method = url.searchParams.get("method") || undefined;
  const sort = (url.searchParams.get("sort") as SortOption) || "newest";

  const page = getEventsPaginated({ cursorId, method, sort });

  return {
    events: page.events,
    nextCursor: page.nextCursor,
    stats: getPlatformStats(),
  };
}

export default function Feed({ loaderData }: Route.ComponentProps) {
  const { events: loaderEvents, nextCursor: loaderNextCursor, stats: initialStats } = loaderData;
  const { stats, newEvents, clearNewEvents } = useLiveData(initialStats);

  const [methodFilter, setMethodFilter] = useState<WasteMethod | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Single source of truth for displayed events
  const [events, setEvents] = useState<WasteEventRow[]>(loaderEvents);
  const [nextCursor, setNextCursor] = useState<number | null>(loaderNextCursor);
  const seenIds = useRef(new Set(loaderEvents.map((e) => e.id)));
  // Tracks whether the in-flight fetcher load is a full replace (filter change)
  // or an append (load more). A ref so it's always up-to-date on the latest load.
  const fetchAction = useRef<"replace" | "append">("replace");
  const isFirstRender = useRef(true);

  const fetcher = useFetcher();

  // SSE: prepend new events — skip ones that don't match the active method filter
  useEffect(() => {
    if (newEvents.length === 0) return;
    const fresh = newEvents
      .filter((e) => !seenIds.current.has(e.id))
      .filter((e) => methodFilter === "all" || e.method === methodFilter);
    if (fresh.length === 0) {
      clearNewEvents();
      return;
    }
    fresh.forEach((e) => seenIds.current.add(e.id));
    setEvents((prev) => [...fresh, ...prev]);
    clearNewEvents();
  }, [newEvents, clearNewEvents, methodFilter]);

  // Filter / sort change → replace first page from server
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchAction.current = "replace";
    const params = new URLSearchParams();
    if (methodFilter !== "all") params.set("method", methodFilter);
    if (sortBy !== "newest") params.set("sort", sortBy);
    fetcher.load(`/feed?${params.toString()}`);
  }, [methodFilter, sortBy]);

  // Handle fetcher data for both replace (filter change) and append (load more)
  useEffect(() => {
    if (!fetcher.data) return;
    const data = fetcher.data as { events: WasteEventRow[]; nextCursor: number | null };
    if (fetchAction.current === "replace") {
      seenIds.current = new Set(data.events.map((e) => e.id));
      setEvents(data.events);
    } else {
      const fresh = data.events.filter((e) => !seenIds.current.has(e.id));
      fresh.forEach((e) => seenIds.current.add(e.id));
      setEvents((prev) => [...prev, ...fresh]);
    }
    setNextCursor(data.nextCursor ?? null);
  }, [fetcher.data]);

  function handleLoadMore() {
    if (!nextCursor || fetcher.state !== "idle") return;
    fetchAction.current = "append";
    const params = new URLSearchParams();
    if (methodFilter !== "all") params.set("method", methodFilter);
    if (sortBy !== "newest") params.set("sort", sortBy);
    params.set("cursor", String(nextCursor));
    fetcher.load(`/feed?${params.toString()}`);
  }

  // Show full-area spinner only when replacing (filter/sort change), not on append
  const isReplacing = fetcher.state !== "idle" && fetchAction.current === "replace";
  const isAppending = fetcher.state !== "idle" && fetchAction.current === "append";

  return (
    <div className="min-h-screen">
      {/* ─── NAV ─── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
              <Flame className="h-5 w-5 text-primary" />
            </div>
            <span className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight">
              Waste<span className="text-primary">Your</span>Money
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link to="/leaderboard" className="px-3 py-2 text-sm font-medium text-text-muted hover:text-text transition-colors">Leaderboard</Link>
            <Link to="/analytics" className="px-3 py-2 text-sm font-medium text-text-muted hover:text-text transition-colors">Analytics</Link>
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

          {/* Sort + View Toggle */}
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

            {/* View mode toggle */}
            <div className="flex items-center rounded-lg border border-border bg-surface overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                title="Grid view"
                className={cn(
                  "flex items-center justify-center w-8 h-8 transition-all",
                  viewMode === "grid"
                    ? "bg-primary/10 text-primary"
                    : "text-text-dim hover:text-text"
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
                  viewMode === "table"
                    ? "bg-primary/10 text-primary"
                    : "text-text-dim hover:text-text"
                )}
              >
                <Table2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── REPLACING SPINNER (filter / sort change) ─── */}
        {isReplacing && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        )}

        {/* ─── GRID VIEW ─── */}
        {!isReplacing && viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {events.map((event) => {
              const method = getMethodInfo(event.method);
              return (
                <div
                  key={event.id}
                  className="group rounded-xl border border-border bg-surface p-5 card-ember"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-lg text-xl"
                      style={{ backgroundColor: `${method.color}15` }}
                    >
                      {method.icon}
                    </div>
                    <span className="flex items-center gap-1 text-xs text-text-dim">
                      <Clock className="h-3 w-3" />
                      {timeAgo(new Date(event.createdAt))}
                    </span>
                  </div>
                  <div className="font-[family-name:var(--font-display)] text-3xl font-extrabold fire-glow mb-2">
                    {formatCurrency(event.amount)}
                  </div>
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
        )}

        {/* ─── TABLE VIEW ─── */}
        {!isReplacing && viewMode === "table" && events.length > 0 && (
          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/80">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-text-dim uppercase tracking-wider">Method</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-text-dim uppercase tracking-wider">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-text-dim uppercase tracking-wider hidden sm:table-cell">By</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-text-dim uppercase tracking-wider hidden md:table-cell">Message</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-text-dim uppercase tracking-wider">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {events.map((event) => {
                  const method = getMethodInfo(event.method);
                  return (
                    <tr key={event.id} className="group hover:bg-primary/5 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-base flex-shrink-0"
                            style={{ backgroundColor: `${method.color}15` }}
                          >
                            {method.icon}
                          </span>
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full hidden xs:inline-flex"
                            style={{ color: method.color, backgroundColor: `${method.color}12` }}
                          >
                            {method.label}
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
                          {method.verb} by{" "}
                          <span className="font-semibold text-text">
                            {event.nickname ?? "Anonymous"}
                          </span>
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
        {!isReplacing && events.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔥</div>
            <p className="text-text-muted text-lg">No waste events match your filter.</p>
            <p className="text-text-dim text-sm mt-1">Be the first to burn some money.</p>
          </div>
        )}

        {/* ─── LOAD MORE ─── */}
        {!isReplacing && events.length > 0 && (
          <div className="flex flex-col items-center gap-3 mt-10">
            <p className="text-xs text-text-dim">
              Showing{" "}
              <span className="font-semibold text-text">{events.length}</span>{" "}
              {nextCursor ? (
                <>events · <span className="text-text-muted">more available</span></>
              ) : (
                <>events · <span className="text-text-muted">all caught up</span></>
              )}
            </p>
            {nextCursor && (
              <button
                onClick={handleLoadMore}
                disabled={isAppending}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-lg border text-sm font-medium transition-all",
                  isAppending
                    ? "border-border text-text-dim cursor-not-allowed"
                    : "border-border bg-surface text-text hover:border-primary hover:text-primary"
                )}
              >
                {isAppending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading…
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Load More
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
