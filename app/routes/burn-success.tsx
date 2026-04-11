import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Flame, ArrowLeft, ArrowRight, Trophy, Share2, Copy, Check, ExternalLink, History } from "lucide-react";
import { formatINR, getMoneyType, getMoneyTypeKey } from "~/lib/utils";

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
    { title: "It's Gone — BurnYourMoney" },
    { name: "description", content: "Your money has been successfully burned into the void." },
  ];
}

export default function BurnSuccess() {
  const [params] = useSearchParams();
  const [copied, setCopied] = useState(false);

  const id = params.get("id") || `burn_${Date.now()}`;
  const amount = Number(params.get("amount")) || 0;
  const nickname = params.get("nickname") || null;
  const message = params.get("message") || null;
  const method = params.get("method") || getMoneyTypeKey(amount);

  const methodInfo = amount ? getMoneyType(amount) : null;
  const receiptUrl = amount ? `/burn/receipt/${id}` : "";
  const shareText = amount && methodInfo
    ? `I just ${methodInfo.verb} ${formatINR(amount)} on BurnYourMoney. No refunds. No ragrets.`
    : "";

  // Save to localStorage on mount
  useEffect(() => {
    if (!amount) return;
    const event: LocalBurnEvent = {
      id,
      amount,
      nickname: nickname || null,
      message: message || null,
      method,
      createdAt: new Date().toISOString(),
    };
    try {
      const stored: LocalBurnEvent[] = JSON.parse(localStorage.getItem("bym_events") || "[]");
      const updated = [event, ...stored.filter((e) => e.id !== id)].slice(0, 50);
      localStorage.setItem("bym_events", JSON.stringify(updated));
    } catch { /* storage unavailable */ }
  }, []);

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
      await navigator.share({ title: "BurnYourMoney — Burn Receipt", text: shareText, url: fullUrl });
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
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-extrabold mb-4">
          It's <span className="fire-glow-intense">Gone</span>
        </h1>

        {amount > 0 ? (
          <>
            <p className="text-text-muted text-lg mb-8">
              You just{" "}
              <span style={{ color: methodInfo!.color }}>{methodInfo!.verb}</span>{" "}
              real money into the void. Congratulations?
            </p>

            {/* Receipt card */}
            <div className="rounded-2xl border border-border bg-surface p-6 mb-6 text-left">
              <div className="text-xs font-bold text-text-dim uppercase tracking-widest mb-4 text-center">
                Burn Receipt
              </div>

              <div className="text-center mb-4">
                <span className="text-5xl mb-2 block">{methodInfo!.icon}</span>
                <div className="font-[family-name:var(--font-display)] text-4xl font-extrabold fire-glow-intense">
                  {formatINR(amount)}
                </div>
                <div className="text-sm text-text-muted mt-1">
                  {methodInfo!.verb} by{" "}
                  <span className="font-semibold text-text">
                    {nickname || "Anonymous"}
                  </span>
                </div>
              </div>

              {message && (
                <div className="border-t border-border pt-4 mt-4">
                  <p className="text-xs text-text-dim mb-1">Last words:</p>
                  <p className="text-sm text-text-muted italic">
                    "{message}"
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
