import { Link, useSearchParams } from "react-router";
import { Flame, ArrowLeft, ShieldX, ArrowRight } from "lucide-react";

const REASONS: Record<string, { title: string; desc: string }> = {
  dismissed: {
    title: "Cold Feet?",
    desc: "You closed the payment window. Your money lives to die another day.",
  },
  payment_failed: {
    title: "Payment Failed",
    desc: "Something went wrong with the payment. Your money is safe... for now.",
  },
  verification_failed: {
    title: "Verification Failed",
    desc: "We couldn't verify the payment. If you were charged, contact support.",
  },
};

const DEFAULT_REASON = {
  title: "Cancelled",
  desc: "The burn was called off. Your money survives this round.",
};

export default function BurnCancel() {
  const [params] = useSearchParams();
  const reason = params.get("reason") || "";
  const { title, desc } = REASONS[reason] || DEFAULT_REASON;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center animate-fade-in-up">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-surface border border-border mb-8">
          <ShieldX className="h-10 w-10 text-text-dim" />
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold mb-3">
          {title}
        </h1>
        <p className="text-text-muted text-lg mb-10">{desc}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/burn"
            className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-sm font-bold text-background hover:bg-primary-hover transition-all hover:shadow-lg hover:shadow-primary-glow"
          >
            <Flame className="h-4 w-4" />
            Try Again
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border text-sm font-semibold text-text-muted hover:text-text hover:bg-surface transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
