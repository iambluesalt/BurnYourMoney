import { Link } from "react-router";
import { Flame, PartyPopper, ArrowRight, Trophy, Share2 } from "lucide-react";
import { db } from "~/lib/db.server";
import { wasteEvents } from "~/lib/schema.server";
import { eq } from "drizzle-orm";
import { formatINR, getMethodInfo } from "~/lib/utils";
import type { Route } from "./+types/burn-success";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const id = Number(url.searchParams.get("id"));

  if (!id) {
    return { event: null };
  }

  const event = db
    .select()
    .from(wasteEvents)
    .where(eq(wasteEvents.id, id))
    .get();

  if (!event) {
    return { event: null };
  }

  return {
    event: {
      id: event.id,
      amount: event.amount,
      method: event.method,
      nickname: event.nickname,
      message: event.message,
      createdAt: event.createdAt.toISOString(),
    },
  };
}

export default function BurnSuccess({ loaderData }: Route.ComponentProps) {
  const { event } = loaderData;
  const methodInfo = event ? getMethodInfo(event.method as any) : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg text-center animate-fade-in-up">
        {/* Fire icon */}
        <div className="relative inline-flex mb-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 animate-pulse-fire">
            <Flame className="h-12 w-12 text-primary" />
          </div>
          <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gold text-background">
            <PartyPopper className="h-4 w-4" />
          </div>
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-extrabold mb-4">
          It's <span className="fire-glow-intense">Gone</span>
        </h1>

        {event ? (
          <>
            <p className="text-text-muted text-lg mb-8">
              You just{" "}
              <span style={{ color: methodInfo!.color }}>{methodInfo!.verb}</span>{" "}
              real money into the void. Congratulations?
            </p>

            {/* Receipt card */}
            <div className="rounded-2xl border border-border bg-surface p-6 mb-8 text-left">
              <div className="text-xs font-bold text-text-dim uppercase tracking-widest mb-4">
                Burn Receipt #{event.id}
              </div>

              <div className="text-center mb-4">
                <span className="text-5xl mb-2 block">{methodInfo!.icon}</span>
                <div className="font-[family-name:var(--font-display)] text-4xl font-extrabold fire-glow-intense">
                  {formatINR(event.amount)}
                </div>
                <div className="text-sm text-text-muted mt-1">
                  {methodInfo!.verb} by{" "}
                  <span className="font-semibold text-text">
                    {event.nickname || "Anonymous"}
                  </span>
                </div>
              </div>

              {event.message && (
                <div className="border-t border-border pt-4 mt-4">
                  <p className="text-xs text-text-dim mb-1">Last words:</p>
                  <p className="text-sm text-text-muted italic">
                    "{event.message}"
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-text-muted text-lg mb-8">
            Your money has been successfully destroyed. There is no going back.
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/burn"
            className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-sm font-bold text-background hover:bg-primary-hover transition-all hover:shadow-lg hover:shadow-primary-glow"
          >
            <Flame className="h-4 w-4" />
            Burn More
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/leaderboard"
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border text-sm font-semibold text-text-muted hover:text-text hover:bg-surface transition-all"
          >
            <Trophy className="h-4 w-4" />
            Leaderboard
          </Link>
          <Link
            to="/feed"
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border text-sm font-semibold text-text-muted hover:text-text hover:bg-surface transition-all"
          >
            Live Feed
          </Link>
        </div>

        <p className="text-text-dim text-xs mt-8">
          No refunds were harmed in the making of this transaction.
          <br />
          (Because there are none.)
        </p>
      </div>
    </div>
  );
}
