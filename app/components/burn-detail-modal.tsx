import { useEffect } from "react";
import { X, Flame } from "lucide-react";
import { Link } from "react-router";
import { formatCurrency, getMoneyType, timeAgo } from "~/lib/utils";

export interface BurnDetail {
  id?: number;
  amount: number;
  method: string;
  nickname: string | null;
  message?: string | null;
  createdAt?: string;  // ISO string (WasteEvent)
  when?: string;       // pre-formatted date (TopBurn)
}

interface Props {
  burn: BurnDetail | null;
  onClose: () => void;
}

export function BurnDetailModal({ burn, onClose }: Props) {
  useEffect(() => {
    if (!burn) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [burn, onClose]);

  if (!burn) return null;

  const method = getMoneyType(burn.amount);
  const date = burn.when ?? (burn.createdAt ? timeAgo(new Date(burn.createdAt)) : null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/75 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl border border-border bg-surface-elevated shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-[60px] pointer-events-none opacity-20"
          style={{ backgroundColor: method.color }}
        />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-text-dim hover:text-text transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative p-8">
          {/* Method icon */}
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl mb-6 mx-auto"
            style={{ backgroundColor: `${method.color}18`, border: `1px solid ${method.color}30` }}
          >
            {method.icon}
          </div>

          {/* Amount */}
          <div className="text-center mb-1">
            <div className="font-[family-name:var(--font-display)] text-5xl font-extrabold fire-glow-intense leading-none">
              {formatCurrency(burn.amount)}
            </div>
          </div>

          {/* Method pill */}
          <div className="flex justify-center mt-3 mb-6">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
              style={{ color: method.color, backgroundColor: `${method.color}15` }}
            >
              {method.verb}
            </span>
          </div>

          {/* Who */}
          <div className="text-center text-sm text-text-muted mb-2">
            by{" "}
            <span className="font-semibold text-text">
              {burn.nickname ?? "Anonymous"}
            </span>
          </div>

          {/* Date */}
          {date && (
            <div className="text-center text-xs text-text-dim mb-5">{date}</div>
          )}

          {/* Message */}
          {burn.message && (
            <div className="rounded-xl border border-border bg-surface px-4 py-3 mb-6">
              <p className="text-sm text-text-muted italic leading-relaxed">
                "{burn.message}"
              </p>
            </div>
          )}

          {/* CTA */}
          <Link
            to="/burn"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-primary text-sm font-bold text-background hover:bg-primary-hover transition-all hover:shadow-lg hover:shadow-primary-glow"
            onClick={onClose}
          >
            <Flame className="h-4 w-4" />
            Burn Your Money Too
          </Link>
        </div>
      </div>
    </div>
  );
}
