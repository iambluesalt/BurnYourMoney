# WasteYourMoney — Project Plan

> The internet's most honest transaction. Pay real money via Razorpay. Get absolutely nothing. Watch it burn on the public leaderboard. Fully anonymous — no accounts, no auth.

---

## Tech Stack

| Layer         | Technology                              |
| ------------- | --------------------------------------- |
| Framework     | React Router v7 (Remix, Vite)           |
| Language      | TypeScript                              |
| Styling       | Tailwind CSS v4 (custom theme)          |
| Database      | SQLite via Drizzle ORM + better-sqlite3 |
| Payments      | Razorpay (inline checkout, donation-style) |
| Charts        | Recharts                                |
| Icons         | Lucide React                            |
| Deployment    | Node.js adapter, Docker                 |

---

## Theme: "Thermal Burn"

Dark, fire-and-ash aesthetic. Warm charcoal blacks, burning orange primary, molten gold accent.

| Role             | Value       | Usage                          |
| ---------------- | ----------- | ------------------------------ |
| Background       | `#0A0A08`   | Page background                |
| Surface          | `#141412`   | Cards, panels                 |
| Border           | `#2A2A27`   | Dividers, outlines            |
| Primary          | `#FF6B35`   | CTAs, highlights, fire glows  |
| Gold             | `#FFB800`   | Accents, badges, top ranks    |
| Danger           | `#DC2626`   | Destructive actions            |
| Text             | `#F5F0E8`   | Primary text                  |
| Text muted       | `#9C978E`   | Secondary text                |
| Text dim         | `#6B6760`   | Disabled, hints               |

**Fonts:** Syne (display/headings) + Outfit (body). Sizes: 14px base, fluid scale.

---

## Implemented

### Routes (Done)

| Route              | File                   | Description                              |
| ------------------ | ---------------------- | ---------------------------------------- |
| `/`                | `landing.tsx`          | Hero, live waste counter, ticker, how-it-works, CTA |
| `/feed`            | `feed.tsx`             | Live waste feed, filter by method, sort  |
| `/leaderboard`     | `leaderboard.tsx`      | Top wasters by total, top 3 trophy glow |
| `/stats`           | `stats.tsx`            | Global charts — over time, by method, by tier, hourly |
| `/wall-of-waste`   | `wall-of-waste.tsx`    | Hall of fame — biggest single burns, #1 featured |

### Design System (Done)

- Tailwind CSS v4 custom theme via CSS variables
- `app.css` — all custom utilities, animations, scrollbar, noise texture
- Components: none (pure semantic HTML + Tailwind)
- Lucide React icons throughout
- Recharts for data visualization

### Data Model (Single table — `WasteEvent`)

No user accounts. No profiles table. Leaderboards are computed by aggregating events grouped by nickname.

Defined in `app/lib/schema.server.ts` using Drizzle's TypeScript schema:

```typescript
waste_events {
  id: integer (autoIncrement PK)
  amount: real             // INR (min ₹1, max ₹9,99,999)
  method: text             // "burn" | "shred" | "flush" | "yeet" | "blackhole" | "feed"
  nickname: text | null    // null = "Anonymous"
  message: text | null     // optional burn note
  created_at: integer      // unix timestamp
}
```

Indexes on `nickname`, `created_at`, `method`. Leaderboard derived via aggregation:
```sql
SELECT nickname, SUM(amount) as totalWasted, COUNT(*) as wasteCount
FROM waste_events
WHERE nickname IS NOT NULL
GROUP BY nickname
ORDER BY totalWasted DESC
```

---

## Remaining — 3 Phases (3-3-4)

### Phase 1 — Database Foundation (3 tasks) ✅

- [x] Add Drizzle ORM with SQLite (better-sqlite3), define `waste_events` table in `schema.server.ts`
- [x] Seed database with 205 realistic events (`scripts/seed.ts`)
- [x] Build DB client singleton (`app/lib/db.server.ts`) with WAL mode

### Phase 2 — Razorpay Integration (3 tasks) ✅

- [x] `/burn` page — amount picker (₹1–₹9,99,999), waste method selector, nickname input, optional message. Creates Razorpay order server-side, opens inline checkout on client
- [x] Payment verification — on successful payment, verify signature server-side (`razorpay_order_id` + `razorpay_payment_id` + `razorpay_signature`), insert `WasteEvent` into DB. Success + cancel pages (`/burn/success`, `/burn/cancel`)
- [x] Rate limiting — prevent spam burns (e.g. max 10 burns per IP per hour). Environment variables: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`

### Phase 3 — Live Data & Polish (4 tasks)

- [ ] Replace dummy data in all routes (`/feed`, `/leaderboard`, `/stats`, `/wall-of-waste`, `/` counter) with real DB queries via Drizzle
- [ ] Real-time updates — SSE or short polling for live waste counter on landing page and feed page
- [ ] Social sharing — generate a shareable "burn receipt" card (OG image or screenshot-friendly component) after each burn
- [ ] Deployment — SQLite persistence in Docker volume, env var setup, SEO meta tags per page

---

## Route Map

| Route               | Status | Description                     |
| ------------------- | ------ | ------------------------------- |
| `/`                 | Done   | Landing page                    |
| `/feed`             | Done   | Live waste feed                 |
| `/leaderboard`      | Done   | Top wasters                     |
| `/stats`            | Done   | Global charts                   |
| `/wall-of-waste`    | Done   | Hall of fame                    |
| `/burn`             | Done   | Razorpay checkout flow          |
| `/burn/verify`      | Done   | Payment signature verification  |
| `/burn/success`     | Done   | Post-payment confirmation       |
| `/burn/cancel`      | Done   | Payment cancelled               |

---

## File Structure (Current)

```
app/
├── app.css                    # Tailwind theme, custom utilities, animations
├── root.tsx                   # Layout, fonts, error boundary
├── routes.ts                  # Route configuration
├── lib/
│   ├── db.server.ts           # Drizzle client singleton (WAL mode)
│   ├── schema.server.ts       # Drizzle table definitions
│   ├── utils.ts               # formatCurrency, formatINR, WASTE_METHODS, cn(), etc.
│   ├── razorpay.server.ts     # Razorpay client + signature verification
│   ├── rate-limit.server.ts   # In-memory IP rate limiter (10/hr)
│   └── dummy-data.ts          # Static dummy data (to be replaced by DB)
└── routes/
    ├── landing.tsx            # Done
    ├── feed.tsx               # Done
    ├── leaderboard.tsx        # Done
    ├── stats.tsx              # Done
    ├── wall-of-waste.tsx      # Done
    ├── burn.tsx               # Done — Razorpay checkout flow
    ├── burn-verify.tsx        # Done — Payment verification API
    ├── burn-success.tsx       # Done — Post-payment confirmation
    └── burn-cancel.tsx        # Done — Payment cancelled
data/
└── waste.db                   # SQLite database (gitignored)
scripts/
└── seed.ts                    # DB seed script
drizzle.config.ts              # Drizzle Kit config
```

---

## Color Palette

| Role       | Hex       |
| ---------- | --------- |
| Primary    | `#FF6B35` |
| Gold       | `#FFB800` |
| Danger     | `#DC2626` |
| Background | `#0A0A08` |
| Surface    | `#141412` |
| Border     | `#2A2A27` |
| Text       | `#F5F0E8` |
| Text muted | `#9C978E` |
| Text dim   | `#6B6760` |
