import { Link, useNavigate } from "react-router";
import { Flame, ArrowLeft } from "lucide-react";

export function meta() {
  return [
    { title: "Terms & Conditions — BurnYourMoney" },
    { name: "description", content: "Terms and conditions for using BurnYourMoney. No refunds. No exceptions." },
    { name: "robots", content: "noindex" },
  ];
}

const SECTIONS = [
  {
    id: "overview",
    title: "1. What This Is",
    body: `BurnYourMoney ("the Service") is a platform that allows users to voluntarily and irrevocably send real money into the void. There is no product, no service, no delivery, and no benefit received in return. You are paying to watch a number go up on a leaderboard. That is the entire point.

By using this Service, you confirm that you understand and accept this completely.`,
  },
  {
    id: "no-refunds",
    title: "2. No Refunds — Ever",
    body: `All burns are final. No refunds will be issued under any circumstances, including but not limited to:

• Buyer's remorse
• Accidental burns
• Relationship breakdowns caused by your burn activity
• Acts of God, war, or economic collapse
• You "didn't mean to click that"

If you initiate a payment, you are agreeing that the money is gone. Chargebacks filed against legitimate burns are considered a violation of these terms and may result in your burns being removed from the leaderboard.`,
  },
  {
    id: "eligibility",
    title: "3. Eligibility",
    body: `You must be at least 18 years of age to use this Service. By proceeding with a burn, you confirm that:

• You are of legal age in your jurisdiction to enter into this agreement
• You have the legal authority to spend the funds you are burning
• You are not burning money that belongs to someone else without their consent
• You are not using funds obtained through illegal means`,
  },
  {
    id: "payments",
    title: "4. Payments & Processing",
    body: `All payments are processed securely by Razorpay. BurnYourMoney does not store your card details, bank credentials, or payment information at any point.

By proceeding to payment, you also agree to Razorpay's Terms of Service and Privacy Policy. Payment processing fees are included in the amount you choose to burn — none of it comes back.`,
  },
  {
    id: "anonymity",
    title: "5. Anonymity & Data",
    body: `Burns are anonymous by default. If you choose to enter a nickname or a message, that text will be publicly visible on the feed, leaderboard, and receipt page associated with your burn.

We store: the amount, your optional nickname, your optional message, the timestamp, and a payment reference. We do not store your name, email, phone number, or payment details.

Burn receipts are permanent public URLs. If you share a receipt link, anyone with that link can view the burn details.`,
  },
  {
    id: "conduct",
    title: "6. Acceptable Use",
    body: `You agree not to use this Service to:

• Launder money or conduct any illegal financial activity
• Test payment systems without genuine intent to burn
• Submit nicknames or messages containing hate speech, slurs, threats, or illegal content
• Automate burns or abuse the platform in ways that degrade service for others

We reserve the right to remove any content that violates these terms without notice.`,
  },
  {
    id: "liability",
    title: "7. Limitation of Liability",
    body: `BurnYourMoney provides this Service "as is" with no warranties of any kind. We are not liable for:

• Any financial loss arising from your use of this Service (the loss is the point)
• Downtime, bugs, or errors that affect your ability to burn
• Any indirect, incidental, or consequential damages

Your sole remedy for dissatisfaction with this Service is to stop using it. You cannot un-burn money.`,
  },
  {
    id: "changes",
    title: "8. Changes to These Terms",
    body: `We may update these terms at any time. Continued use of the Service after changes are posted constitutes acceptance of the new terms. We will update the "Last updated" date below when changes are made.

If you disagree with any terms, your option is simple: don't burn.`,
  },
  {
    id: "contact",
    title: "9. Contact",
    body: `For any concerns about these terms or a specific transaction, you can reach us via the contact information on our site. We will respond, but we will not issue refunds.`,
  },
];

export default function Terms() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      {/* ─── NAV ─── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link to="/" className="group">
            <span className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight">
              <span className="text-primary">.</span>burn<span className="text-primary">your</span>money
            </span>
          </Link>
          <Link
            to="/burn"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-sm font-bold text-background hover:bg-primary-hover transition-all hover:shadow-lg hover:shadow-primary-glow"
          >
            <Flame className="h-4 w-4" />
            Burn
          </Link>
        </div>
      </nav>

      {/* ─── HEADER ─── */}
      <div className="border-b border-border bg-surface/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-text-dim hover:text-text transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold mb-2">
            Terms & Conditions
          </h1>
          <p className="text-text-muted text-sm">
            Last updated: April 2025. Read these before you burn.
          </p>
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        {/* TL;DR callout */}
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 mb-10">
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">TL;DR</p>
          <p className="text-text-muted text-sm leading-relaxed">
            You are spending real money voluntarily. There are no refunds, no products, and no returns.
            Burns are public by default if you add a nickname. You must be 18+.
            Payments go through Razorpay. Don't do anything illegal.
          </p>
        </div>

        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold mb-3">
                {section.title}
              </h2>
              <div className="text-text-muted text-sm leading-relaxed whitespace-pre-line">
                {section.body}
              </div>
            </section>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="text-text-muted text-sm mb-6">
            You've read the terms. You understand there are no refunds.<br />
            Now, are you going to burn something?
          </p>
          <Link
            to="/burn"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-sm font-bold text-background hover:bg-primary-hover transition-all hover:shadow-lg hover:shadow-primary-glow"
          >
            <Flame className="h-4 w-4" />
            Let's Go
          </Link>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border py-8 mt-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-text-dim">
            &copy; {new Date().getFullYear()} BurnYourMoney — No refunds. No ragrets.
          </p>
        </div>
      </footer>
    </div>
  );
}
