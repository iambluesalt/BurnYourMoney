import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Flame, PartyPopper, ArrowLeft, ArrowRight, Trophy, Share2, Copy, Check, ExternalLink, History } from "lucide-react";
import { getEventById } from "~/lib/queries.server";
import { formatINR, getMoneyType } from "~/lib/utils";
import type { Route } from "./+types/burn-success";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const id = Number(url.searchParams.get("id"));

  if (!id) {
    return { event: null };
  }

  const event = getEventById(id);
  return { event };
}

export default function BurnSuccess({ loaderData }: Route.ComponentProps) {
  const { event } = loaderData;
  const methodInfo = event ? getMoneyType(event.amount) : null;
  const [copied, setCopied] = useState(false);

  // Save this burn ID to localStorage history
  useEffect(() => {
    if (!event) return;
    try {
      const stored: number[] = JSON.parse(localStorage.getItem("wym_burns") || "[]");
      const updated = [event.id, ...stored.filter((id) => id !== event.id)].slice(0, 50);
      localStorage.setItem("wym_burns", JSON.stringify(updated));
    } catch { /* storage unavailable */ }
  }, [event?.id]);

  const receiptUrl = event ? `/burn/receipt/${event.id}` : "";
  const shareText = event && methodInfo
    ? `I just ${methodInfo.verb} ${formatINR(event.amount)} on WasteYourMoney. No refunds. No ragrets.`
    : "";

  function handleCopyLink() {
    const fullUrl = `${window.location.origin}${receiptUrl}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleShareTwitter() {
    const fullUrl = `${window.location.origin}${receiptUrl}`;
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function handleNativeShare() {
    if (!navigator.share) return;
    const fullUrl = `${window.location.origin}${receiptUrl}`;
    try {
      await navigator.share({ title: "WasteYourMoney — Burn Receipt", text: shareText, url: fullUrl });
    } catch { /* user cancelled */ }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <Link
        to="/"
        className="absolute top-4 left-4 flex items-center gap-1.5 text-sm text-text-dim hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </Link>
      <div className="w-full max-w-lg text-center">
        {/* Fire icon */}
        <div className="relative inline-flex mb-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 animate-pulse-fire">
            <Flame className="h-12 w-12 text-primary" />
          </div>
          {/* <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gold text-background">
            <PartyPopper className="h-4 w-4" />
          </div> */}
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
            <div className="rounded-2xl border border-border bg-surface p-6 mb-6 text-left">
              <div className="text-xs font-bold text-text-dim uppercase tracking-widest mb-4 text-center">
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

            {/* Share buttons */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-surface text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-hover transition-all"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <button
                onClick={handleShareTwitter}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-surface text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-hover transition-all"
              >
                <span className="text-sm">𝕏</span>
                Share
              </button>
              {"share" in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-surface text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-hover transition-all"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </button>
              )}
              <Link
                to={receiptUrl}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-surface text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-hover transition-all"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Receipt
              </Link>
            </div>
          </>
        ) : (
          <p className="text-text-muted text-lg mb-8">
            Your money has been successfully destroyed. There is no going back.
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3">
          <Link
            to="/burn"
            className="group flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-sm font-bold text-background hover:bg-primary-hover transition-all hover:shadow-lg hover:shadow-primary-glow whitespace-nowrap"
          >
            <Flame className="h-4 w-4" />
            Burn More
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/leaderboard"
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-border text-sm font-semibold text-text-muted hover:text-text hover:bg-surface transition-all whitespace-nowrap"
          >
            <Trophy className="h-4 w-4" />
            Leaderboard
          </Link>
          <Link
            to="/feed"
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-border text-sm font-semibold text-text-muted hover:text-text hover:bg-surface transition-all whitespace-nowrap"
          >
            Live Feed
          </Link>
          <Link
            to="/my-burns"
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-border text-sm font-semibold text-text-muted hover:text-text hover:bg-surface transition-all whitespace-nowrap"
          >
            <History className="h-4 w-4" />
            My Burns
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
