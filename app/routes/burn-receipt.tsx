import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { getEventById } from "~/lib/queries.server";
import { formatINR, getMethodInfo } from "~/lib/utils";
import type { Route } from "./+types/burn-receipt";

export function meta({ data }: Route.MetaArgs) {
  if (!data?.event) {
    return [
      { title: "Burn Receipt — WasteYourMoney" },
      { name: "description", content: "This burn receipt doesn't exist." },
    ];
  }

  const { event } = data;
  const method = getMethodInfo(event.method as any);
  const title = `${method.icon} ${formatINR(event.amount)} ${method.verb} — WasteYourMoney`;
  const description = `${event.nickname || "Anonymous"} just ${method.verb} ${formatINR(event.amount)} into the void.${event.message ? ` "${event.message}"` : ""}`;

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "WasteYourMoney" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
}

export function loader({ params }: Route.LoaderArgs) {
  const id = Number(params.id);
  if (!id) return { event: null };

  const event = getEventById(id);
  return { event };
}

export default function BurnReceipt({ loaderData }: Route.ComponentProps) {
  const { event } = loaderData;

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative">
        <Link
          to="/"
          className="absolute top-4 left-4 flex items-center gap-1.5 text-sm text-text-dim hover:text-text transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
        <div className="text-center">
          <div className="text-6xl mb-4">🕳️</div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-2">
            Receipt Not Found
          </h1>
          <p className="text-text-muted">
            This burn doesn't exist. Maybe it was burned too.
          </p>
        </div>
      </div>
    );
  }

  const method = getMethodInfo(event.method as any);
  const date = new Date(event.createdAt);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <Link
        to="/"
        className="absolute top-4 left-4 flex items-center gap-1.5 text-sm text-text-dim hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </Link>

      {/* Receipt card — optimized for 1200×630 OG ratio */}
      <div className="w-full max-w-xl">
        <div className="relative rounded-3xl border-2 border-border bg-surface overflow-hidden">
          {/* Top accent bar */}
          <div
            className="h-2"
            style={{ background: `linear-gradient(90deg, ${method.color}, #FFB800)` }}
          />

          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <span className="text-primary text-lg">🔥</span>
                <span className="font-[family-name:var(--font-display)] text-sm font-bold tracking-tight">
                  Waste<span className="text-primary">Your</span>Money
                </span>
              </div>
              <div className="text-xs text-text-dim font-mono">
                #{String(event.id).padStart(6, "0")}
              </div>
            </div>

            {/* Main amount */}
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">{method.icon}</div>
              <div className="font-[family-name:var(--font-display)] text-5xl sm:text-6xl font-extrabold fire-glow-intense mb-2">
                {formatINR(event.amount)}
              </div>
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
                style={{ color: method.color, backgroundColor: `${method.color}15` }}
              >
                {method.label}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-border my-6" />

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <div className="text-text-dim text-xs uppercase tracking-widest mb-1">
                  Waster
                </div>
                <div className="font-semibold">
                  {event.nickname || "Anonymous"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-text-dim text-xs uppercase tracking-widest mb-1">
                  Date
                </div>
                <div className="font-semibold">{formattedDate}</div>
              </div>
              <div>
                <div className="text-text-dim text-xs uppercase tracking-widest mb-1">
                  Method
                </div>
                <div className="font-semibold capitalize">
                  {method.icon} {method.verb}
                </div>
              </div>
              <div className="text-right">
                <div className="text-text-dim text-xs uppercase tracking-widest mb-1">
                  Time
                </div>
                <div className="font-semibold">{formattedTime}</div>
              </div>
            </div>

            {/* Message */}
            {event.message && (
              <>
                <div className="border-t border-dashed border-border my-6" />
                <div>
                  <div className="text-text-dim text-xs uppercase tracking-widest mb-2">
                    Last Words
                  </div>
                  <p className="text-text-muted italic text-sm">
                    "{event.message}"
                  </p>
                </div>
              </>
            )}

            {/* Footer */}
            <div className="border-t border-dashed border-border mt-6 pt-6">
              <div className="flex items-center justify-between text-xs text-text-dim">
                <span>wasteyourmoney.com</span>
                <span>No refunds. No ragrets.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
