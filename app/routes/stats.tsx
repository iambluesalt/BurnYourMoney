import { BarChart2 } from "lucide-react";
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
  wasteOverTimeData,
  wasteByMethodData,
  wasteByAmountTierData,
  hourlyDistributionData,
  getPlatformStats,
} from "~/lib/dummy-data";
import { formatCompactCurrency, WASTE_METHODS } from "~/lib/utils";

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

export default function Stats() {
  const stats = getPlatformStats();

  return (
    <div className="min-h-screen">
      {/* ─── HEADER ─── */}
      <div className="border-b border-border bg-surface/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <BarChart2 className="h-5 w-5 text-primary" />
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold">
              Global Stats
            </h1>
          </div>
          <p className="text-text-muted text-sm ml-[44px]">
            Every cent the world has burned, visualized. You're welcome.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

        {/* ─── BIG STATS ROW ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 stagger-children">
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
              value: `$${(stats.totalWasted / stats.totalEvents).toFixed(2)}`,
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
          <div className="mb-1">
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold">
              Waste Over Time
            </h3>
          </div>
          <p className="text-xs text-text-dim mb-6">Monthly total dollars incinerated</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wasteOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A27" />
                <XAxis dataKey="month" stroke="#6B6760" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#6B6760"
                  fontSize={12}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                  tickLine={false}
                />
                <Tooltip
                  {...chartTooltipStyle}
                  formatter={(value: number) => [
                    `$${value.toLocaleString()}`,
                    "Burned",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#FF6B35"
                  strokeWidth={3}
                  dot={{ fill: "#FF6B35", r: 5, strokeWidth: 2, stroke: "#141412" }}
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
                    formatter={(value: number) => [
                      `$${value.toLocaleString()}`,
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
                    formatter={(value: number) => [`${value}`, "Events"]}
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

        {/* ─── HOURLY DISTRIBUTION ─── */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="font-[family-name:var(--font-display)] text-xl font-bold mb-1">
            When People Waste
          </h3>
          <p className="text-xs text-text-dim mb-6">
            Hourly distribution — apparently 6pm is when wallets catch fire
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyDistributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A27" />
                <XAxis dataKey="hour" stroke="#6B6760" fontSize={11} tickLine={false} />
                <YAxis stroke="#6B6760" fontSize={12} tickLine={false} />
                <Tooltip
                  {...chartTooltipStyle}
                  formatter={(value: number) => [`${value} events`, "Burns"]}
                />
                <Bar dataKey="count" fill="#FFB800" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
