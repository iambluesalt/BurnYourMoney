import { Skull } from "lucide-react";
import { wallOfWaste } from "~/lib/dummy-data";
import { formatCurrency, getMethodInfo } from "~/lib/utils";

export default function WallOfWaste() {
  const biggest = wallOfWaste[0];
  const rest = wallOfWaste.slice(1);

  return (
    <div className="min-h-screen">
      {/* ─── HEADER ─── */}
      <div className="border-b border-border bg-surface/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger/10 border border-danger/20">
              <Skull className="h-5 w-5 text-danger" />
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold">
              Wall of <span className="text-danger">Shame</span>
            </h1>
          </div>
          <p className="text-text-muted text-sm ml-[44px]">
            The biggest single wastes of all time. Financial disasters immortalized.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* ─── #1 HIGHLIGHT ─── */}
        {biggest && (
          <div className="relative rounded-3xl border-2 border-gold/40 bg-gradient-to-b from-gold/8 to-transparent p-8 sm:p-12 mb-10 overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-gold/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative text-center">
              <div className="text-6xl mb-4 drop-shadow-lg">🏆</div>
              <div className="text-xs font-bold text-gold uppercase tracking-widest mb-4">
                #1 Biggest Waste of All Time
              </div>

              <div className="font-[family-name:var(--font-display)] text-6xl sm:text-8xl font-extrabold fire-glow-intense mb-2">
                {formatCurrency(biggest.amount)}
              </div>

              <div className="flex items-center justify-center gap-3 mt-6">
                {(() => {
                  const method = getMethodInfo(biggest.method);
                  return (
                    <>
                      <span
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold"
                        style={{
                          color: method.color,
                          backgroundColor: `${method.color}15`,
                        }}
                      >
                        {method.icon} {method.label}
                      </span>
                      <span className="text-text-dim text-sm">by</span>
                      <span className="font-bold text-lg">
                        {biggest.nickname ?? "Anonymous"}
                      </span>
                    </>
                  );
                })()}
              </div>

              <div className="text-text-dim text-sm mt-2">{biggest.when}</div>
            </div>
          </div>
        )}

        {/* ─── THE REST ─── */}
        <div className="space-y-4">
          {rest.map((waste) => {
            const method = getMethodInfo(waste.method);
            return (
              <div
                key={waste.rank}
                className="relative rounded-2xl border border-border bg-surface p-6 flex flex-col sm:flex-row sm:items-center gap-5 card-ember"
              >
                {/* Rank */}
                <div className="flex items-center gap-4">
                  <div
                    className={`
                      flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold flex-shrink-0
                      ${waste.rank === 2 ? "bg-gray-500/10 text-gray-400" : "bg-orange-700/10 text-orange-700"}
                    `}
                  >
                    #{waste.rank}
                  </div>
                </div>

                {/* Method icon */}
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl flex-shrink-0"
                  style={{ backgroundColor: `${method.color}15` }}
                >
                  {method.icon}
                </div>

                {/* Name + method */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base">
                    {waste.nickname ?? "Anonymous"}
                  </div>
                  <div className="text-xs text-text-dim mt-0.5">
                    {waste.when} · {method.verb}
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <div className="font-[family-name:var(--font-display)] text-2xl font-extrabold fire-glow">
                    {formatCurrency(waste.amount)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── NOTE ─── */}
        <div className="mt-10 text-center border-t border-border pt-8">
          <p className="text-text-dim text-sm max-w-md mx-auto">
            These amounts represent single transactions. Every dollar on this wall was
            paid with zero expectation of return. That's the whole point.
          </p>
        </div>
      </div>
    </div>
  );
}
