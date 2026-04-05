import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useFetcher, useNavigate } from "react-router";
import { Flame, ArrowLeft, Sparkles, Skull, AlertTriangle } from "lucide-react";
import { WASTE_METHODS, type WasteMethod, cn, formatINR } from "~/lib/utils";
import { razorpay, RAZORPAY_KEY_ID } from "~/lib/razorpay.server";
import { checkRateLimit } from "~/lib/rate-limit.server";
import type { Route } from "./+types/burn";

const PRESET_AMOUNTS = [10, 50, 100, 500, 1000, 5000];
const MIN_AMOUNT = 1;
const MAX_AMOUNT = 999999;

export async function loader() {
  return { razorpayKeyId: RAZORPAY_KEY_ID };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const amount = Number(formData.get("amount"));
  const method = formData.get("method") as string;
  const nickname = (formData.get("nickname") as string)?.trim() || null;
  const message = (formData.get("message") as string)?.trim() || null;

  // Validate
  if (!amount || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
    return { error: "Amount must be between ₹1 and ₹9,99,999" };
  }
  if (!method || !(method in WASTE_METHODS)) {
    return { error: "Pick a destruction method" };
  }

  // Rate limit
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return {
      error: `Slow down, pyromaniac. Try again in ${Math.ceil(rateLimit.resetIn / 60)} minutes.`,
    };
  }

  // Create Razorpay order
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: `waste_${Date.now()}`,
      notes: {
        method,
        nickname: nickname || "",
        message: message || "",
      },
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  } catch (e) {
    console.error("Razorpay order creation failed:", e);
    return { error: "Payment setup failed. Try again." };
  }
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Burn({ loaderData }: Route.ComponentProps) {
  const { razorpayKeyId } = loaderData;
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();

  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [method, setMethod] = useState<WasteMethod>("burn");
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const scriptLoaded = useRef(false);

  // Load Razorpay script
  useEffect(() => {
    if (scriptLoaded.current) return;
    if (document.querySelector('script[src*="razorpay"]')) {
      scriptLoaded.current = true;
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      scriptLoaded.current = true;
    };
    document.head.appendChild(script);
  }, []);

  // Handle order created → open Razorpay checkout
  useEffect(() => {
    const data = fetcher.data;
    if (!data || "error" in data || !("orderId" in data)) return;
    if (checkoutOpen) return;

    setCheckoutOpen(true);

    const options = {
      key: razorpayKeyId,
      amount: data.amount,
      currency: data.currency,
      order_id: data.orderId,
      name: "WasteYourMoney",
      description: `${WASTE_METHODS[method].icon} ${WASTE_METHODS[method].verb} ${formatINR(amount)}`,
      theme: {
        color: "#FF6B35",
        backdrop_color: "rgba(10,10,8,0.85)",
      },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        // Verify payment server-side
        try {
          const res = await fetch("/burn/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const result = await res.json();
          if (result.success) {
            navigate(`/burn/success?id=${result.eventId}`);
          } else {
            navigate("/burn/cancel?reason=verification_failed");
          }
        } catch {
          navigate("/burn/cancel?reason=verification_failed");
        }
      },
      modal: {
        ondismiss: () => {
          setCheckoutOpen(false);
          navigate("/burn/cancel?reason=dismissed");
        },
        escape: true,
        confirm_close: true,
      },
      prefill: {
        name: nickname || "Anonymous Waster",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", () => {
      setCheckoutOpen(false);
      navigate("/burn/cancel?reason=payment_failed");
    });
    rzp.open();
  }, [fetcher.data]);

  const effectiveAmount = isCustom ? Number(customAmount) || 0 : amount;
  const isSubmitting = fetcher.state !== "idle";
  const error = fetcher.data && "error" in fetcher.data ? fetcher.data.error : null;
  const methodInfo = WASTE_METHODS[method];

  const handleSubmit = useCallback(() => {
    if (effectiveAmount < MIN_AMOUNT || effectiveAmount > MAX_AMOUNT) return;
    const formData = new FormData();
    formData.set("amount", String(effectiveAmount));
    formData.set("method", method);
    formData.set("nickname", nickname);
    formData.set("message", message);
    fetcher.submit(formData, { method: "post" });
  }, [effectiveAmount, method, nickname, message, fetcher]);

  return (
    <div className="min-h-screen">
      {/* ─── HEADER ─── */}
      <div className="border-b border-border bg-surface/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-text-dim hover:text-text transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to safety
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold">
              Burn Your <span className="fire-glow-intense">Money</span>
            </h1>
          </div>
          <p className="text-text-muted text-sm">
            Choose your amount. Pick your destruction method. No refunds. No
            regrets. Okay, maybe some regrets.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* ─── AMOUNT ─── */}
        <section>
          <label className="block text-xs font-bold text-text-dim uppercase tracking-widest mb-4">
            How much to destroy?
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setAmount(preset);
                  setIsCustom(false);
                  setCustomAmount("");
                }}
                className={cn(
                  "rounded-xl border py-3 text-center font-[family-name:var(--font-display)] font-bold text-lg transition-all",
                  !isCustom && amount === preset
                    ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary-glow"
                    : "border-border bg-surface text-text-muted hover:border-primary/30 hover:text-text"
                )}
              >
                {formatINR(preset)}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim font-bold text-lg">
              ₹
            </span>
            <input
              type="number"
              min={MIN_AMOUNT}
              max={MAX_AMOUNT}
              value={isCustom ? customAmount : ""}
              placeholder="Custom amount"
              onFocus={() => setIsCustom(true)}
              onChange={(e) => {
                setIsCustom(true);
                setCustomAmount(e.target.value);
              }}
              className={cn(
                "w-full rounded-xl border bg-surface pl-10 pr-4 py-3.5 text-lg font-[family-name:var(--font-display)] font-bold outline-none transition-all placeholder:text-text-dim/50 placeholder:font-normal",
                isCustom
                  ? "border-primary/40 ring-1 ring-primary/20"
                  : "border-border focus:border-primary/40"
              )}
            />
          </div>
          {isCustom && Number(customAmount) > MAX_AMOUNT && (
            <p className="text-danger text-xs mt-2 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Max ₹9,99,999 per burn
            </p>
          )}
        </section>

        {/* ─── METHOD ─── */}
        <section>
          <label className="block text-xs font-bold text-text-dim uppercase tracking-widest mb-4">
            Destruction method
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(Object.entries(WASTE_METHODS) as [WasteMethod, (typeof WASTE_METHODS)[WasteMethod]][]).map(
              ([key, info]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMethod(key)}
                  className={cn(
                    "relative rounded-xl border p-4 text-left transition-all group",
                    method === key
                      ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary-glow"
                      : "border-border bg-surface hover:border-primary/25 hover:bg-surface-hover"
                  )}
                >
                  <div className="text-2xl mb-2">{info.icon}</div>
                  <div className="font-[family-name:var(--font-display)] font-bold text-sm">
                    {info.label}
                  </div>
                  {method === key && (
                    <div className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-primary" />
                  )}
                </button>
              )
            )}
          </div>
        </section>

        {/* ─── IDENTITY ─── */}
        <section className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-dim uppercase tracking-widest mb-2">
              Nickname <span className="text-text-dim/50 normal-case font-normal">(optional)</span>
            </label>
            <input
              type="text"
              maxLength={30}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Anonymous"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-all placeholder:text-text-dim/50 focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-dim uppercase tracking-widest mb-2">
              Last words <span className="text-text-dim/50 normal-case font-normal">(optional)</span>
            </label>
            <textarea
              maxLength={140}
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Any final words before it's gone?"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-all placeholder:text-text-dim/50 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 resize-none"
            />
            <p className="text-text-dim text-xs mt-1 text-right">
              {message.length}/140
            </p>
          </div>
        </section>

        {/* ─── ERROR ─── */}
        {error && (
          <div className="rounded-xl border border-danger/30 bg-danger/5 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {/* ─── SUMMARY + CTA ─── */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-text-muted">You are about to</div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="text-xl">{methodInfo.icon}</span>
              <span style={{ color: methodInfo.color }}>{methodInfo.label}</span>
            </div>
          </div>
          <div className="text-center mb-6">
            <div className="font-[family-name:var(--font-display)] text-5xl sm:text-6xl font-extrabold fire-glow-intense">
              {effectiveAmount > 0 ? formatINR(effectiveAmount) : "₹0"}
            </div>
            <p className="text-text-dim text-sm mt-2">
              into the absolute void. Gone forever.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              effectiveAmount < MIN_AMOUNT ||
              effectiveAmount > MAX_AMOUNT ||
              checkoutOpen
            }
            className={cn(
              "w-full flex items-center justify-center gap-3 rounded-2xl py-4 text-lg font-extrabold transition-all",
              isSubmitting || checkoutOpen
                ? "bg-primary/50 text-background/50 cursor-wait"
                : effectiveAmount < MIN_AMOUNT
                  ? "bg-surface-hover text-text-dim cursor-not-allowed border border-border"
                  : "bg-primary text-background hover:bg-primary-hover hover:shadow-xl hover:shadow-primary-glow active:scale-[0.98]"
            )}
          >
            {isSubmitting ? (
              <>
                <Sparkles className="h-5 w-5 animate-pulse" />
                Setting fire...
              </>
            ) : checkoutOpen ? (
              <>
                <Sparkles className="h-5 w-5 animate-pulse" />
                Complete payment...
              </>
            ) : (
              <>
                <Flame className="h-5 w-5" />
                {effectiveAmount >= MIN_AMOUNT
                  ? `Burn ${formatINR(effectiveAmount)} Now`
                  : "Enter an amount"}
              </>
            )}
          </button>

          <p className="text-center text-text-dim text-xs mt-4 flex items-center justify-center gap-1.5">
            <Skull className="h-3 w-3" />
            No refunds. Processed via Razorpay.
          </p>
        </div>
      </div>
    </div>
  );
}
