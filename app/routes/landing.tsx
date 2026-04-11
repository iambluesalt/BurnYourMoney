import { useState } from "react";
import { Link, useLoaderData } from "react-router";
import { ArrowRight, Flame, TrendingUp, Users, Zap, Trophy, CheckCircle2 } from "lucide-react";
import { BurnDetailModal, type BurnDetail } from "~/components/burn-detail-modal";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getPlatformStats,
  getRecentEvents,
  getTopSingleBurns,
  getWasteOverTime,
} from "~/lib/queries.server";
import { formatCurrency, formatCompactCurrency, formatBigCounter, timeAgo, getMoneyType } from "~/lib/utils";

function WasteTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface-elevated px-3.5 py-2.5 shadow-lg">
      <p className="text-xs text-text-dim mb-1">{label}</p>
      <p className="font-[family-name:var(--font-display)] text-sm font-bold" style={{ color: "#FF6B35" }}>
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export async function loader() {
  const [stats, recentEvents, topWastes, chartData] = await Promise.all([
    getPlatformStats(),
    getRecentEvents(8),
    getTopSingleBurns(3),
    getWasteOverTime(),
  ]);
  return { stats, recentEvents, topWastes, chartData };
}

export function meta() {
  return [
    { title: "BurnYourMoney — Burn Real Money For No Reason" },
    { name: "description", content: "The internet's most honest transaction. Pay real money via Razorpay. Get absolutely nothing. Watch it burn on the public leaderboard." },
    { property: "og:title", content: "BurnYourMoney — Burn Real Money For No Reason" },
    { property: "og:description", content: "Pay real money. Get absolutely nothing. Climb the leaderboard." },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "BurnYourMoney" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "BurnYourMoney — Burn Real Money For No Reason" },
    { name: "twitter:description", content: "Pay real money. Get absolutely nothing. Climb the leaderboard." },
  ];
}

export default function Landing() {
  const { stats, recentEvents, topWastes, chartData } = useLoaderData<typeof loader>();
  const [selectedBurn, setSelectedBurn] = useState<BurnDetail | null>(null);

  // Podium order: 2nd place left, 1st place center, 3rd place right
  const podiumOrder = [topWastes[1], topWastes[0], topWastes[2]].filter(Boolean);

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

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-radial pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-primary/5 text-primary text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {formatCompactCurrency(stats.totalWasted)} incinerated and counting
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-6xl sm:text-8xl lg:text-[96px] font-extrabold tracking-tight leading-[0.92] mb-8">
            Burn Your Money
            <br />
            <span className="fire-glow-intense">Get Nothing Back</span>
          </h1>

          <p className="mx-auto max-w-xl text-lg sm:text-xl text-text-muted leading-relaxed mb-12">
            The most honest transaction on the internet. Pay real money. Receive
            absolutely nothing. Climb the leaderboard. You were warned.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/burn"
              className="group flex items-center gap-3 px-10 py-4 rounded-2xl bg-primary text-lg font-extrabold text-background hover:bg-primary-hover transition-all hover:shadow-xl hover:shadow-primary-glow"
            >
              <Flame className="h-5 w-5" />
              Start Burning
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/leaderboard"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-border text-text-muted font-semibold hover:text-text hover:bg-surface transition-all"
            >
              See The Leaderboard
            </Link>
          </div>

          {/* Live waste counter */}
          <div>
            <p className="text-text-dim text-xs uppercase tracking-widest mb-3 font-medium">
              Total Wasted on This Platform
            </p>
            <div className="font-[family-name:var(--font-display)] text-5xl sm:text-7xl font-extrabold animate-counter-glow hero-counter">
              {formatBigCounter(stats.totalWasted)}
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="border-y border-border bg-surface/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
            {[
              {
                label: "Total Incinerated",
                value: formatCompactCurrency(stats.totalWasted),
                icon: <Flame className="h-4 w-4" />,
                color: "#FF4500",
              },
              {
                label: "Burns Executed",
                value: stats.totalEvents.toLocaleString(),
                icon: <Zap className="h-4 w-4" />,
                color: "#FF6B35",
              },
              {
                label: "Biggest Single Burn",
                value: topWastes[0] ? formatCompactCurrency(topWastes[0].amount) : "—",
                icon: <Trophy className="h-4 w-4" />,
                color: "#FFB800",
              },
              {
                label: "Unique Burners",
                value: stats.totalBurners.toLocaleString(),
                icon: <Users className="h-4 w-4" />,
                color: "#A855F7",
              },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center justify-center gap-1.5 py-6 px-4 text-center">
                <div
                  className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest mb-1"
                  style={{ color: stat.color }}
                >
                  {stat.icon}
                  {stat.label}
                </div>
                <div
                  className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TICKER ─── */}
      <div className="border-b border-border bg-surface/40 overflow-hidden">
        <div className="ticker-mask flex overflow-hidden py-3">
          <div className="flex animate-ticker gap-8 whitespace-nowrap">
            {[...recentEvents, ...recentEvents].map((event, i) => {
              const tier = getMoneyType(event.amount);
              return (
                <span key={`${i}-${event.id}`} className="flex items-center gap-2 text-sm text-text-muted">
                  <span className="text-base">{tier.icon}</span>
                  <span className="font-semibold text-text">{event.nickname ?? "Anonymous"}</span>
                  <span className="text-text-dim">just {tier.verb}</span>
                  <span className="font-[family-name:var(--font-display)] font-bold fire-glow">
                    {formatCurrency(event.amount)}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── HOW IT WORKS ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center mb-16">
          <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold mb-4">
            How It <span className="fire-glow">Works</span>
          </h2>
          <p className="text-text-muted text-lg max-w-md mx-auto">
            Three steps to financial regret. Couldn't be simpler.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              icon: <Flame className="h-7 w-7" />,
              title: "Choose Amount",
              desc: "Pick how much you want to throw away. Every cent goes straight into the void.",
              color: "#FF4500",
            },
            {
              step: "02",
              icon: <Zap className="h-7 w-7" />,
              title: "Reveal Your Type",
              desc: "Loose Change, Money Bag, Diamond Burn, Royal Waste — your amount unlocks your tier. Go bigger.",
              color: "#FF6B35",
            },
            {
              step: "03",
              icon: <TrendingUp className="h-7 w-7" />,
              title: "Watch It Go",
              desc: "Your waste goes public. See it on the feed, climb the leaderboard, earn your badge of dishonor.",
              color: "#FFB800",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="relative overflow-hidden rounded-2xl border border-border bg-surface p-8 group card-ember"
            >
              <div
                className="inline-flex p-3 rounded-xl mb-5"
                style={{ backgroundColor: `${item.color}15`, color: item.color }}
              >
                {item.icon}
              </div>
              <div className="text-xs font-bold text-text-dim uppercase tracking-widest mb-2">
                Step {item.step}
              </div>
              <h3 className="font-[family-name:var(--font-display)] text-xl font-bold mb-3">
                {item.title}
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
              <span
                className="absolute -bottom-6 -right-4 font-[family-name:var(--font-display)] text-[120px] font-extrabold opacity-[0.04] pointer-events-none select-none transition-transform duration-300 group-hover:scale-110 group-hover:opacity-[0.07] -rotate-12"
                style={{ color: item.color }}
                aria-hidden="true"
              >
                {item.step}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WHY? MANIFESTO ─── */}
      <section className="border-t border-border bg-surface/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="text-xs font-bold text-primary uppercase tracking-widest mb-4">The Philosophy</div>
              <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
                The Only Honest
                <br />
                <span className="fire-glow-intense">Transaction Online</span>
              </h2>
              <p className="text-text-muted text-lg leading-relaxed mb-8">
                Every other app promises value. We promise nothing — and we deliver exactly that.
                There are no hidden fees, no surprise upsells, no tracking your habits.
                Just you, your wallet, and a spectacular waste of money.
              </p>
              <Link
                to="/burn"
                className="group inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-hover transition-colors"
              >
                Join the waste
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="space-y-4">
              {[
                { title: "No refunds. Ever.",       desc: "You knew what you were doing. We respect that." },
                { title: "No products. No services.", desc: "We are not a store. Nothing is for sale. Nothing will arrive." },
                { title: "No dark patterns.",        desc: "The checkout process is depressingly straightforward." },
                { title: "100% transparent waste.",  desc: "Every burn is public. The leaderboard is real. The shame is optional." },
                { title: "Your money, your call.",   desc: "Adults wasting their own money, watched by the internet. Peak entertainment." },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 rounded-xl border border-border bg-surface p-4">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-text text-sm mb-0.5">{item.title}</div>
                    <div className="text-text-muted text-sm">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── RECENT BURNS + CHART ─── */}
      <section className="border-t border-border bg-surface/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold mb-2">
                Live <span className="fire-glow">Activity</span>
              </h2>
              <p className="text-text-muted">Recent burns and trend.</p>
            </div>
            <div className="hidden sm:flex items-center gap-5">
              <Link to="/feed" className="flex items-center gap-1.5 text-sm font-semibold text-text-muted hover:text-text transition-colors">
                All burns <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link to="/analytics" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors">
                Full analytics <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentEvents.slice(0, 4).map((event) => {
                const tier = getMoneyType(event.amount);
                return (
                  <button
                    key={event.id}
                    onClick={() => setSelectedBurn({ amount: event.amount, method: event.method, nickname: event.nickname, message: event.message, createdAt: event.createdAt })}
                    className="relative overflow-hidden rounded-xl border border-border bg-surface p-5 card-ember group text-left cursor-pointer hover:border-primary/30 transition-colors"
                  >
                    <div className="flex justify-start mb-3">
                      <span className="text-xs text-text-dim">{timeAgo(new Date(event.createdAt))}</span>
                    </div>
                    <div className="font-[family-name:var(--font-display)] text-3xl font-extrabold fire-glow mb-1">
                      {formatCurrency(event.amount)}
                    </div>
                    <div className="text-xs text-text-muted">
                      {tier.verb} by{" "}
                      <span className="font-semibold text-text">
                        {event.nickname ?? "Anonymous"}
                      </span>
                    </div>
                    <span className="absolute -bottom-5 -right-4 text-[90px] opacity-[0.12] pointer-events-none select-none transition-transform duration-300 group-hover:scale-110 group-hover:opacity-[0.2] -rotate-12" aria-hidden="true">
                      {tier.icon}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
              <div className="text-xs font-bold text-text-dim uppercase tracking-widest mb-4">
                Monthly waste trend
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="burnGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF6B35" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#FF6B35" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#2A2A27" strokeDasharray="4 4" />
                  <XAxis dataKey="label" tick={{ fill: "#6B6760", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6B6760", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCompactCurrency(v)} width={56} />
                  <Tooltip content={<WasteTooltip />} cursor={{ stroke: "#2A2A27", strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="amount" stroke="#FF6B35" strokeWidth={2} fill="url(#burnGradient)" dot={false} activeDot={{ r: 4, fill: "#FF6B35", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BIGGEST BURNS PODIUM ─── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center mb-16">
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold mb-4">
              The Wall of <span className="fire-glow-intense">Shame</span>
            </h2>
            <p className="text-text-muted max-w-md mx-auto">
              The biggest single wastes of all time. These people need an intervention.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {podiumOrder.map((waste) => {
              if (!waste) return null;
              const tier = getMoneyType(waste.amount);
              const isFirst = waste.rank === 1;

              const medalColors: Record<number, { border: string; bg: string; badge: string }> = {
                1: { border: "#FFB800", bg: "#FFB80008", badge: "#FFB800" },
                2: { border: "#9C978E", bg: "#9C978E08", badge: "#9C978E" },
                3: { border: "#8B6540", bg: "#8B654008", badge: "#8B6540" },
              };
              const medal = medalColors[waste.rank] ?? medalColors[3];

              return (
                <button
                  key={waste.rank}
                  onClick={() => setSelectedBurn(waste)}
                  className="relative rounded-2xl border p-6 overflow-hidden text-left card-ember hover:brightness-110 transition-all cursor-pointer"
                  style={{ borderColor: `${medal.border}50`, backgroundColor: medal.bg }}
                >
                  <div className="absolute top-4 right-4 text-xs font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ color: medal.badge, backgroundColor: `${medal.badge}15` }}>
                    #{waste.rank}
                  </div>
                  <div className={`font-[family-name:var(--font-display)] text-3xl font-extrabold mb-1 ${isFirst ? "fire-glow-intense" : "fire-glow"}`}>
                    {formatCurrency(waste.amount)}
                  </div>
                  <div className="text-sm text-text-muted">
                    {tier.verb} by{" "}
                    <span className="font-semibold text-text">{waste.nickname ?? "Anonymous"}</span>
                  </div>
                  <div className="text-xs text-text-dim mt-1">{waste.when}</div>
                  {isFirst && (
                    <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ boxShadow: `inset 0 0 40px ${medal.badge}10` }} />
                  )}
                  <span className="absolute -bottom-5 -right-4 text-[90px] opacity-[0.12] pointer-events-none select-none transition-transform duration-300 group-hover:scale-110 group-hover:opacity-[0.2] -rotate-12" aria-hidden="true">
                    {tier.icon}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link to="/leaderboard" className="inline-flex items-center gap-2 font-semibold text-text-muted hover:text-text transition-all">
              View Full Leaderboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-6xl font-extrabold mb-6 leading-tight">
            Ready to Light Your
            <br />
            <span className="fire-glow-intense">Money on Fire?</span>
          </h2>
          <p className="text-text-muted text-lg max-w-lg mx-auto mb-10">
            No products. No services. No refunds. Just you, your wallet, and the
            void. The most honest transaction you'll ever make.
          </p>
          <Link
            to="/burn"
            className="group inline-flex items-center gap-3 px-12 py-5 rounded-2xl bg-primary text-xl font-extrabold text-background hover:bg-primary-hover transition-all hover:shadow-xl hover:shadow-primary-glow"
          >
            <Flame className="h-6 w-6" />
            Waste Your Money Now
            <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      <BurnDetailModal burn={selectedBurn} onClose={() => setSelectedBurn(null)} />

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="font-[family-name:var(--font-display)] font-bold">
              <span className="text-primary">.</span>burn<span className="text-primary">your</span>money
            </div>
            <div className="flex items-center gap-6 text-sm text-text-dim">
              <Link to="/feed" className="hover:text-text transition-colors">Feed</Link>
              <Link to="/leaderboard" className="hover:text-text transition-colors">Leaderboard</Link>
              <Link to="/analytics" className="hover:text-text transition-colors">Analytics</Link>
              <Link to="/terms" className="hover:text-text transition-colors">Terms</Link>
            </div>
            <p className="text-xs text-text-dim">
              &copy; {new Date().getFullYear()} — No refunds. No ragrets.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
