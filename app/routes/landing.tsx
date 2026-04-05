import { Link } from "react-router";
import { ArrowRight, Flame, TrendingUp, Users, Zap } from "lucide-react";
import { wasteEvents, wallOfWaste, getPlatformStats } from "~/lib/dummy-data";
import { formatCurrency, formatCompactCurrency, formatBigCounter, timeAgo, getMethodInfo } from "~/lib/utils";

export default function Landing() {
  const stats = getPlatformStats();
  const recentEvents = wasteEvents.slice(0, 8);
  const topWastes = wallOfWaste.slice(0, 3);

  return (
    <div className="min-h-screen overflow-hidden">
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
          <div className="flex items-center gap-2">
            <Link
              to="/feed"
              className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text transition-colors"
            >
              Live Feed
            </Link>
            <Link
              to="/leaderboard"
              className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              to="/burn"
              className="ml-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-sm font-bold text-background hover:bg-primary-hover transition-all hover:shadow-lg hover:shadow-primary-glow"
            >
              <Flame className="h-4 w-4" />
              Waste Now
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative">
        {/* Ambient glow */}
        <div className="absolute inset-0 hero-radial pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          {/* Label */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-primary/5 text-primary text-sm font-medium mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {formatCompactCurrency(stats.totalWasted)} incinerated and counting
          </div>

          {/* Headline */}
          <h1 className="font-[family-name:var(--font-display)] text-6xl sm:text-8xl lg:text-[96px] font-extrabold tracking-tight leading-[0.92] mb-8 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
            Burn Your Money
            <br />
            <span className="fire-glow-intense">Get Nothing Back</span>
          </h1>

          <p className="mx-auto max-w-xl text-lg sm:text-xl text-text-muted leading-relaxed mb-12 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            The most honest transaction on the internet. Pay real money. Receive
            absolutely nothing. Climb the leaderboard. You were warned.
          </p>

          {/* Big CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <Link
              to="/burn"
              className="group flex items-center gap-3 px-10 py-4 rounded-2xl bg-primary text-lg font-extrabold text-background hover:bg-primary-hover transition-all hover:shadow-xl hover:shadow-primary-glow"
            >
              <Flame className="h-5 w-5" />
              Start Burning
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/wall-of-waste"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-border text-text-muted font-semibold hover:text-text hover:bg-surface transition-all"
            >
              See The Biggest Burns
            </Link>
          </div>

          {/* Live waste counter */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <p className="text-text-dim text-xs uppercase tracking-widest mb-3 font-medium">
              Total Wasted on This Platform
            </p>
            <div className="font-[family-name:var(--font-display)] text-5xl sm:text-7xl font-extrabold animate-counter-glow hero-counter">
              {formatBigCounter(stats.totalWasted)}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TICKER ─── */}
      <div className="border-y border-border bg-surface/40 overflow-hidden">
        <div className="ticker-mask flex overflow-hidden py-3">
          <div className="flex animate-ticker gap-8 whitespace-nowrap">
            {[...recentEvents, ...recentEvents].map((event, i) => {
              const method = getMethodInfo(event.method);
              return (
                <span key={i} className="flex items-center gap-2 text-sm text-text-muted">
                  <span className="text-base">{method.icon}</span>
                  <span className="font-semibold text-text">
                    {event.nickname ?? "Anonymous"}
                  </span>
                  <span className="text-text-dim">just {method.verb}</span>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
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
              title: "Pick Your Method",
              desc: "Burn it, shred it, flush it, yeet it into a black hole. Each method has its own energy.",
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
              className="relative rounded-2xl border border-border bg-surface p-8 group card-ember"
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
            </div>
          ))}
        </div>
      </section>

      {/* ─── RECENT WASTES ─── */}
      <section className="border-t border-border bg-surface/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold mb-2">
                Recent <span className="fire-glow">Burns</span>
              </h2>
              <p className="text-text-muted">Live. Real. Unsponsored.</p>
            </div>
            <Link
              to="/feed"
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {recentEvents.slice(0, 8).map((event) => {
              const method = getMethodInfo(event.method);
              return (
                <div
                  key={event.id}
                  className="rounded-xl border border-border bg-surface p-5 card-ember group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
                      style={{ backgroundColor: `${method.color}15` }}
                    >
                      {method.icon}
                    </div>
                    <span className="text-xs text-text-dim">{timeAgo(event.createdAt)}</span>
                  </div>
                  <div className="font-[family-name:var(--font-display)] text-2xl font-extrabold fire-glow mb-1">
                    {formatCurrency(event.amount)}
                  </div>
                  <div className="text-xs text-text-muted">
                    {method.verb} by{" "}
                    <span className="font-semibold text-text">
                      {event.nickname ?? "Anonymous"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── WALL OF WASTE PREVIEW ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center mb-12">
          <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold mb-4">
            Wall of <span className="fire-glow-intense">Shame</span>
          </h2>
          <p className="text-text-muted max-w-md mx-auto">
            The biggest single wastes of all time. These people need an intervention.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 stagger-children">
          {topWastes.map((waste) => {
            const method = getMethodInfo(waste.method);
            return (
              <div
                key={waste.rank}
                className={`
                  relative rounded-2xl border p-6 overflow-hidden
                  ${waste.rank === 1 ? "border-gold/40 bg-gold/5" : "border-border bg-surface"}
                  card-ember
                `}
              >
                {waste.rank === 1 && (
                  <div className="absolute top-3 right-3 text-gold text-xs font-bold uppercase tracking-widest">
                    Biggest
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl flex-shrink-0"
                    style={{ backgroundColor: `${method.color}15` }}
                  >
                    {method.icon}
                  </div>
                  <div>
                    <div className="font-[family-name:var(--font-display)] text-3xl font-extrabold fire-glow-intense mb-1">
                      {formatCurrency(waste.amount)}
                    </div>
                    <div className="text-sm text-text-muted">
                      {method.verb} by{" "}
                      <span className="font-semibold text-text">
                        {waste.nickname ?? "Anonymous"}
                      </span>
                    </div>
                    <div className="text-xs text-text-dim mt-1">{waste.when}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/wall-of-waste"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border font-semibold text-text-muted hover:text-text hover:bg-surface transition-all"
          >
            See Full Hall of Shame
            <ArrowRight className="h-4 w-4" />
          </Link>
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

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              <span className="font-[family-name:var(--font-display)] font-bold">
                WasteYourMoney
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-text-dim">
              <Link to="/feed" className="hover:text-text transition-colors">Feed</Link>
              <Link to="/leaderboard" className="hover:text-text transition-colors">Leaderboard</Link>
              <Link to="/stats" className="hover:text-text transition-colors">Stats</Link>
              <Link to="/wall-of-waste" className="hover:text-text transition-colors">Wall of Shame</Link>
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
