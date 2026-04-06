import { useState } from "react";
import { BarChart2, Flame } from "lucide-react";
import { Link } from "react-router";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  getPlatformStats,
  getWasteOverTimePeriod,
  getWasteByMethod,
  getWasteByAmountTier,
  getWasteByDayOfWeek,
} from "~/lib/queries.server";
import { formatCompactCurrency, cn } from "~/lib/utils";
import type { Route } from "./+types/stats";

export function meta() {
  return [
    { title: "Analytics — WasteYourMoney" },
    { name: "description", content: "Every cent the world has burned, visualized. Charts, trends, and breakdowns of global money waste." },
    { property: "og:title", content: "Analytics — WasteYourMoney" },
    { property: "og:description", content: "Every cent the world has burned, visualized." },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "WasteYourMoney" },
    { name: "twitter:card", content: "summary" },
  ];
}

const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: "#141412",
    border: "1px solid #2A2A27",
    borderRadius: "10px",
    color: "#F5F0E8",
    fontSize: "13px",
    boxShadow: "0 4px 20px #00000040",
  },
  labelStyle: { color: "#9C978E" },
};

export function loader() {
  return {
    stats: getPlatformStats(),
    wasteOverTime7d: getWasteOverTimePeriod("7d"),
    wasteOverTime30d: getWasteOverTimePeriod("30d"),
    wasteOverTime3m: getWasteOverTimePeriod("3m"),
    wasteOverTimeAll: getWasteOverTimePeriod("all"),
    wasteByMethodData: getWasteByMethod(),
    wasteByAmountTierData: getWasteByAmountTier(),
    wasteByDayOfWeekData: getWasteByDayOfWeek(),
  };
}

type Period = "7d" | "30d" | "3m" | "all";

export default function Stats({ loaderData }: Route.ComponentProps) {
  const { stats, wasteOverTime7d, wasteOverTime30d, wasteOverTime3m, wasteOverTimeAll, wasteByMethodData, wasteByAmountTierData, wasteByDayOfWeekData } = loaderData;
  const [period, setPeriod] = useState<Period>("30d");

  const periodData = {
    "7d": wasteOverTime7d,
    "30d": wasteOverTime30d,
    "3m": wasteOverTime3m,
    "all": wasteOverTimeAll,
  };
  const wasteOverTimeData = periodData[period];

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

      {/* ─── HEADER ─── */}
      <div className="border-b border-border bg-surface/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <BarChart2 className="h-5 w-5 text-primary" />
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold">
              Analytics
            </h1>
          </div>
          <p className="text-text-muted text-sm ml-[44px]">
            Every cent the world has burned, visualized. You're welcome.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

        {/* ─── BIG STATS ROW ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: "Total Incinerated",
              value: formatCompactCurrency(stats.totalWasted),
              sub: `Across ${stats.totalEvents.toLocaleString()} waste events`,
            },
            {
              label: "Waste Events",
              value: stats.totalEvents.toLocaleString(),
              sub: "Real money, real waste",
            },
            {
              label: "Wasters",
              value: stats.totalBurners.toLocaleString(),
              sub: "Unique burners on the leaderboard",
            },
            {
              label: "Avg Per Event",
              value: `₹${(stats.totalWasted / stats.totalEvents).toFixed(2)}`,
              sub: "Per waste transaction",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-surface p-6 card-ember"
            >
              <div className="text-xs font-bold text-text-dim uppercase tracking-widest mb-2">
                {stat.label}
              </div>
              <div className="font-[family-name:var(--font-display)] text-3xl font-extrabold fire-glow mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-text-dim">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* ─── WASTE OVER TIME ─── */}
        <div className="rounded-2xl border border-border bg-surface p-6 mb-6">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold">
              Waste Over Time
            </h3>
            <div className="flex gap-1">
              {(["7d", "30d", "3m", "all"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold transition-all border",
                    period === p
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-surface-elevated border-border text-text-dim hover:text-text"
                  )}
                >
                  {p === "all" ? "All" : p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-text-dim mb-6">
            {period === "7d" ? "Daily totals — last 7 days" :
             period === "30d" ? "Daily totals — last 30 days" :
             period === "3m" ? "Weekly totals — last 3 months" :
             "Monthly totals — all time"}
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wasteOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A27" />
                <XAxis
                  dataKey="label"
                  stroke="#6B6760"
                  fontSize={11}
                  tickLine={false}
                  interval={period === "7d" ? 0 : period === "30d" ? 4 : "preserveStartEnd"}
                />
                <YAxis
                  stroke="#6B6760"
                  fontSize={12}
                  tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`}
                  tickLine={false}
                />
                <Tooltip
                  {...chartTooltipStyle}
                  formatter={(value) => [
                    `₹${Number(value).toLocaleString("en-IN")}`,
                    "Burned",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#FF6B35"
                  strokeWidth={3}
                  dot={period === "7d" ? { fill: "#FF6B35", r: 5, strokeWidth: 2, stroke: "#141412" } : false}
                  activeDot={{
                    r: 7,
                    fill: "#FF6B35",
                    stroke: "#FF6B35",
                    strokeWidth: 2,
                    filter: "drop-shadow(0 0 8px #FF6B3560)",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ─── TWO COLUMN GRIDS ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* By Method */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold mb-1">
              By Method
            </h3>
            <p className="text-xs text-text-dim mb-6">What the world burns most</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={wasteByMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="method"
                    stroke="none"
                  >
                    {wasteByMethodData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    {...chartTooltipStyle}
                    formatter={(value) => [
                      `₹${Number(value).toLocaleString("en-IN")}`,
                      "Burned",
                    ]}
                  />
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "12px", color: "#9C978E" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* By Amount Tier */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold mb-1">
              By Amount Tier
            </h3>
            <p className="text-xs text-text-dim mb-6">Distribution of waste sizes</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wasteByAmountTierData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A27" />
                  <XAxis dataKey="tier" stroke="#6B6760" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6B6760" fontSize={12} tickLine={false} />
                  <Tooltip
                    {...chartTooltipStyle}
                    formatter={(value) => [`${value}`, "Events"]}
                  />
                  <Bar
                    dataKey="count"
                    fill="#FF6B35"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ─── WASTE BY DAY OF WEEK ─── */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="font-[family-name:var(--font-display)] text-xl font-bold mb-1">
            Waste by Day of Week
          </h3>
          <p className="text-xs text-text-dim mb-6">
            Which day sees the most money torched — pick your poison
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wasteByDayOfWeekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A27" />
                <XAxis dataKey="day" stroke="#6B6760" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#6B6760"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`}
                />
                <Tooltip
                  {...chartTooltipStyle}
                  formatter={(value, name) => [
                    name === "total"
                      ? `₹${Number(value).toLocaleString("en-IN")}`
                      : `${value}`,
                    name === "total" ? "Burned" : "Events",
                  ]}
                />
                <Bar dataKey="total" fill="#FFB800" radius={[4, 4, 0, 0]} name="total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
