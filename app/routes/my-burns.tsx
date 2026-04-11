import { Link } from "react-router";
import { Flame, ArrowRight, Receipt, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatINR, timeAgo, getMoneyType } from "~/lib/utils";
import type { Route } from "./+types/my-burns";

interface LocalBurnEvent {
  id: string;
  amount: number;
  nickname: string | null;
  message: string | null;
  method: string;
  createdAt: string;
}

export function meta() {
  return [
    { title: "My Burns — BurnYourMoney" },
    { name: "description", content: "Your personal burn history, stored locally." },
  ];
}

export async function clientLoader(): Promise<{ events: LocalBurnEvent[] }> {
  try {
    const stored: LocalBurnEvent[] = JSON.parse(localStorage.getItem("bym_events") || "[]");
    return { events: stored };
  } catch {
    return { events: [] };
  }
}
clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-text-dim text-sm animate-pulse">Loading your burns…</div>
    </div>
  );
}

export default function MyBurns({ loaderData }: Route.ComponentProps) {
  const { events } = loaderData as { events: LocalBurnEvent[] };
  const [cleared, setCleared] = useState(false);

  function handleClear() {
    localStorage.removeItem("bym_events");
    setCleared(true);
  }

  const displayEvents = cleared ? [] : events;

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link to="/" className="group">
            <span className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight">
              <span className="text-primary">.</span>waste<span className="text-primary">your</span>money
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link to="/feed" className="px-3 py-2 text-sm font-medium text-text-muted hover:text-text transition-colors">Live Feed</Link>
            <Link to="/leaderboard" className="px-3 py-2 text-sm font-medium text-text-muted hover:text-text transition-colors">Leaderboard</Link>
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

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold mb-1">
              My Burns
            </h1>
            <p className="text-sm text-text-muted">
              Stored locally on this device. No account needed.
            </p>
          </div>
          {displayEvents.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs text-text-dim hover:text-red-400 hover:border-red-400/30 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear history
            </button>
          )}
        </div>

        {displayEvents.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-12 text-center">
            <div className="text-5xl mb-4">🕳️</div>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-2">
              No burns yet
            </h2>
            <p className="text-text-muted text-sm mb-8">
              {cleared
                ? "History cleared. Start fresh."
                : "Burns you make on this device will appear here."}
            </p>
            <Link
              to="/burn"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-sm font-bold text-background hover:bg-primary-hover transition-all hover:shadow-lg hover:shadow-primary-glow"
            >
              <Flame className="h-4 w-4" />
              Waste Something
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {displayEvents.map((event) => {
              const method = getMoneyType(event.amount);
              return (
                <Link
                  key={event.id}
                  to={`/burn/receipt/${event.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-4 hover:bg-surface-hover hover:border-border-hover transition-all group"
                >
                  <div
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl"
                    style={{ backgroundColor: `${method.color}15` }}
                  >
                    {method.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-[family-name:var(--font-display)] text-lg font-extrabold fire-glow-intense">
                        {formatINR(event.amount)}
                      </span>
                      <span className="text-xs font-semibold" style={{ color: method.color }}>
                        {method.verb}
                      </span>
                    </div>
                    <div className="text-xs text-text-dim mt-0.5 truncate">
                      {event.nickname ? (
                        <span className="text-text-muted">{event.nickname}</span>
                      ) : (
                        <span>Anonymous</span>
                      )}
                      {event.message && (
                        <span className="ml-2 italic">"{event.message}"</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs text-text-dim">
                      {timeAgo(new Date(event.createdAt))}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-text-dim group-hover:text-primary transition-colors">
                      <Receipt className="h-3 w-3" />
                      Receipt
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {displayEvents.length > 0 && (
          <p className="text-center text-xs text-text-dim mt-8">
            Receipts are saved on this device only — bookmark them if you clear this history.
          </p>
        )}
      </div>
    </div>
  );
}
