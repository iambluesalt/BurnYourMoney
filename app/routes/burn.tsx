import { useState, useCallback, useEffect, useRef } from "react";
import { Link, useLoaderData, useFetcher, useSubmit, useNavigate } from "react-router";
import { Flame, ArrowLeft, AlertTriangle, X, Loader2, Skull } from "lucide-react";
import { razorpay, RAZORPAY_KEY_ID } from "~/lib/razorpay.server";
import { MONEY_TYPES, getMoneyType, getMoneyTypeKey, cn, formatINR } from "~/lib/utils";

export async function loader() {
  return { keyId: RAZORPAY_KEY_ID };
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const amount = Number(formData.get("amount"));

  if (!amount || amount < 1 || amount > 999999) {
    throw new Response("Invalid amount", { status: 400 });
  }

  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100), // Razorpay expects paise
    currency: "INR",
    receipt: `burn_${Date.now()}`,
  });

  return {
    orderId: String(order.id),
    amount: Number(order.amount),
    currency: String(order.currency),
  };
}

export function meta() {
  return [
    { title: "Burn Your Money — BurnYourMoney" },
    { name: "description", content: "Choose your amount and burn real money into the void. No refunds." },
    { property: "og:title", content: "Burn Your Money — BurnYourMoney" },
    { property: "og:description", content: "Choose your amount and burn real money into the void." },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "BurnYourMoney" },
    { name: "twitter:card", content: "summary" },
  ];
}

const PRESET_AMOUNTS = [10, 50, 100, 500, 1000, 5000];
const MIN_AMOUNT = 1;
const MAX_AMOUNT = 999999;

export default function Burn() {
  const { keyId } = useLoaderData<typeof loader>();
  const orderFetcher = useFetcher<typeof action>();
  const submit = useSubmit();
  const navigate = useNavigate();

  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [warningOpen, setWarningOpen] = useState(false);
  const [understood, setUnderstood] = useState(false);

  const effectiveAmount = isCustom ? Number(customAmount) || 0 : amount;
  const moneyTypeInfo = getMoneyType(effectiveAmount);
  const isCreatingOrder = orderFetcher.state !== "idle";

  // Capture burn metadata for use inside the Razorpay handler closure
  const burnMeta = useRef({ nickname: "", message: "", method: "", amount: 0 });
  // Track which orderId has already been opened to prevent double-firing
  const openedOrderRef = useRef<string | null>(null);

  // Load Razorpay checkout script
  useEffect(() => {
    if (document.querySelector('script[src*="checkout.razorpay"]')) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(script);
  }, []);

  // Open Razorpay modal once order is created
  useEffect(() => {
    if (orderFetcher.state !== "idle" || !orderFetcher.data) return;
    const { orderId, amount: orderAmount, currency } = orderFetcher.data;

    if (openedOrderRef.current === orderId) return;
    openedOrderRef.current = orderId;

    type RzpResponse = {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    };

    const options = {
      key: keyId,
      amount: orderAmount,
      currency,
      name: "BurnYourMoney",
      description: `${moneyTypeInfo.label} — burn it all`,
      order_id: orderId,
      handler(response: RzpResponse) {
        submit(
          {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            amount: String(burnMeta.current.amount),
            method: burnMeta.current.method,
            nickname: burnMeta.current.nickname,
            message: burnMeta.current.message,
          },
          { method: "post", action: "/burn/verify" }
        );
      },
      prefill: { name: burnMeta.current.nickname || "Anonymous" },
      theme: { color: "#FF6B35" },
      modal: {
        ondismiss() {
          openedOrderRef.current = null;
        },
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }, [orderFetcher.state, orderFetcher.data, keyId, moneyTypeInfo.label, submit]);

  const handleSubmit = useCallback(() => {
    if (effectiveAmount < MIN_AMOUNT || effectiveAmount > MAX_AMOUNT) return;
    setUnderstood(false);
    setWarningOpen(true);
  }, [effectiveAmount]);

  const handleConfirm = useCallback(() => {
    setWarningOpen(false);
    burnMeta.current = {
      nickname: nickname.trim(),
      message: message.trim(),
      method: getMoneyTypeKey(effectiveAmount),
      amount: effectiveAmount,
    };
    orderFetcher.submit(
      { amount: String(effectiveAmount) },
      { method: "post" }
    );
  }, [effectiveAmount, nickname, message, orderFetcher]);

  return (
    <div className="min-h-screen">
      {/* ─── HEADER ─── */}
      <div className="border-b border-border bg-surface/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-text-dim hover:text-text transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to safety
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold">
              Burn Your <span className="fire-glow-intense">Money</span>
            </h1>
          </div>
          <p className="text-text-muted text-sm">
            Choose your amount. Your money type reveals itself. No refunds. No
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

        {/* ─── MONEY TYPE ─── */}
        <section>
          <label className="block text-xs font-bold text-text-dim uppercase tracking-widest mb-4">
            Your money type
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {Object.entries(MONEY_TYPES).map(([key, info]) => {
              const isActive = effectiveAmount >= info.min && effectiveAmount <= info.max;
              return (
                <div
                  key={key}
                  className={cn(
                    "relative rounded-xl border p-3 text-center transition-all",
                    isActive
                      ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary-glow scale-105"
                      : "border-border bg-surface opacity-40"
                  )}
                >
                  <div className="text-2xl mb-1">{info.icon}</div>
                  <div className="font-[family-name:var(--font-display)] font-bold text-[10px] leading-tight">
                    {info.label}
                  </div>
                  <div className="text-[9px] text-text-dim mt-0.5">
                    {info.max === Infinity ? `₹${(info.min / 1000).toFixed(0)}K+` : `₹${info.min}–${info.max}`}
                  </div>
                  {isActive && (
                    <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              );
            })}
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

        {/* ─── SUMMARY + CTA ─── */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-text-muted">You are about to burn</div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="text-xl">{moneyTypeInfo.icon}</span>
              <span style={{ color: moneyTypeInfo.color }}>{moneyTypeInfo.label}</span>
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
            disabled={effectiveAmount < MIN_AMOUNT || effectiveAmount > MAX_AMOUNT || isCreatingOrder}
            className={cn(
              "w-full flex items-center justify-center gap-3 rounded-2xl py-4 text-lg font-extrabold transition-all",
              effectiveAmount < MIN_AMOUNT || effectiveAmount > MAX_AMOUNT || isCreatingOrder
                ? "bg-surface-hover text-text-dim cursor-not-allowed border border-border"
                : "bg-primary text-background hover:bg-primary-hover hover:shadow-xl hover:shadow-primary-glow active:scale-[0.98]"
            )}
          >
            {isCreatingOrder ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Opening payment…
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
            No refunds. Powered by Razorpay.
          </p>
          <p className="text-center text-text-dim/60 text-xs mt-2">
            By burning you agree to our{" "}
            <Link to="/terms" className="underline underline-offset-2 hover:text-text-dim transition-colors">
              Terms & Conditions
            </Link>
          </p>
        </div>
      </div>

      {/* ─── WARNING MODAL ─── */}
      {warningOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setWarningOpen(false)}
          />

          <div className="relative w-full max-w-md rounded-2xl border border-danger/40 bg-surface shadow-2xl shadow-danger/10 p-8">
            <button
              onClick={() => setWarningOpen(false)}
              className="absolute top-4 right-4 text-text-dim hover:text-text transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 border border-danger/20 mb-6 mx-auto">
              <AlertTriangle className="h-7 w-7 text-danger" />
            </div>

            <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold text-center mb-2">
              Wait — are you sure?
            </h2>
            <p className="text-text-muted text-sm text-center mb-6">
              You are about to burn{" "}
              <span className="font-bold fire-glow">{formatINR(effectiveAmount)}</span>{" "}
              into the void. Real money. No returns.
            </p>

            <div className="rounded-xl border border-border bg-background/50 p-4 space-y-3 mb-6 text-sm text-text-muted">
              <div className="flex items-start gap-2.5">
                <span className="text-danger mt-0.5">✗</span>
                <span>There are <strong className="text-text">no refunds</strong>, no exceptions, no appeals.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-danger mt-0.5">✗</span>
                <span>You receive <strong className="text-text">nothing</strong> in return — no product, no service.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-danger mt-0.5">✗</span>
                <span>Your burn may appear <strong className="text-text">publicly</strong> on the feed and leaderboard.</span>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer mb-6 group">
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={understood}
                  onChange={(e) => setUnderstood(e.target.checked)}
                  className="sr-only"
                />
                <div className={cn(
                  "h-5 w-5 rounded border-2 flex items-center justify-center transition-all",
                  understood
                    ? "bg-danger border-danger"
                    : "border-border group-hover:border-danger/50"
                )}>
                  {understood && <span className="text-white text-xs font-bold">✓</span>}
                </div>
              </div>
              <span className="text-sm text-text-muted leading-snug">
                I understand this money is gone forever and I am doing this willingly.
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setWarningOpen(false)}
                className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-text-muted hover:text-text hover:bg-surface-hover transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!understood}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-extrabold transition-all",
                  understood
                    ? "bg-danger text-white hover:bg-danger/90 hover:shadow-lg hover:shadow-danger/20"
                    : "bg-surface border border-border text-text-dim cursor-not-allowed"
                )}
              >
                <Flame className="h-4 w-4" />
                Burn it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
