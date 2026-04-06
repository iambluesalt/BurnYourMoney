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

### Phase 3 — Live Data & Polish (4 tasks) ✅

- [x] Replace dummy data in all routes (`/feed`, `/leaderboard`, `/stats`, `/wall-of-waste`, `/` counter) with real DB queries via Drizzle
- [x] Real-time updates — SSE or short polling for live waste counter on landing page and feed page
- [x] Social sharing — generate a shareable "burn receipt" card (OG image or screenshot-friendly component) after each burn
- [x] Deployment — SQLite persistence in Docker volume, env var setup, SEO meta tags per page

---

## Phase 3 — Detailed Breakdown

### 3.2 Real-Time Updates

**Goal:** Landing page counter and feed page update automatically when new burns happen, without full page reload.

**Approach:** Server-Sent Events (SSE) — lightweight, unidirectional, native browser support, no extra deps.

| Step | Task | Files |
|------|------|-------|
| 1 | Create SSE resource route (`/api/stream`) that holds open a connection and sends new events + updated total counter on an interval (poll DB every 3–5s for new events since last check) | `app/routes/api.stream.ts` (new) |
| 2 | Build `useSSE` or `useEventSource` hook that connects to `/api/stream`, reconnects on drop, and exposes latest events + totalWasted | `app/lib/use-live-data.ts` (new) |
| 3 | Wire into landing page — live counter animates when totalWasted changes, ticker shows genuinely new burns | `app/routes/landing.tsx` |
| 4 | Wire into feed page — new events prepend to the list with an entrance animation, "X new burns" toast if user has scrolled down | `app/routes/feed.tsx` |
| 5 | Graceful degradation — if SSE fails or JS disabled, pages still work with loader data (already the case) | — |

**Notes:**
- SSE route should set `Cache-Control: no-cache`, `Content-Type: text/event-stream`
- Use `lastEventId` / timestamp cursor to avoid sending duplicates
- Close connection on client unmount to avoid leak

### 3.3 Social Sharing — Burn Receipt

**Goal:** After a successful burn, user gets a shareable "receipt" card they can screenshot or share via link.

| Step | Task | Files |
|------|------|-------|
| 1 | Create a standalone receipt component — dark card with burn amount, method icon, nickname, message, timestamp, QR-style pattern or border. Optimized for 1200×630 (OG image ratio) and mobile screenshot | `app/routes/burn-success.tsx` (enhance existing receipt section) |
| 2 | Create an OG image route (`/burn/receipt/:id`) that returns a static HTML page with just the receipt card, sized for screenshots, with OG meta tags pointing to itself | `app/routes/burn-receipt.tsx` (new) |
| 3 | Add share buttons on `/burn/success` — copy link, share to Twitter/X (pre-filled text: "I just {method.verb} {amount} on WasteYourMoney"), generic Web Share API fallback | `app/routes/burn-success.tsx` |
| 4 | Add `<meta>` OG tags to the receipt route: `og:title`, `og:description`, `og:image` (point to a simple server-rendered card or placeholder), `og:url` | `app/routes/burn-receipt.tsx` |

**Notes:**
- Keep it server-rendered HTML+CSS, no canvas/puppeteer — simple and fast
- Receipt page is public (no auth) so anyone with the link can view it
- Twitter card format: `summary_large_image`

### 3.4 Deployment & SEO

**Goal:** Production-ready Docker setup, proper env config, SEO meta on every page.

| Step | Task | Files |
|------|------|-------|
| 1 | Create `Dockerfile` — multi-stage Node build, copy `data/` dir as volume mount point, run migrations on startup | `Dockerfile` (new) |
| 2 | Create `docker-compose.yml` — service definition, volume for `data/waste.db`, env vars from `.env` file | `docker-compose.yml` (new) |
| 3 | Create `.env.example` with all required env vars documented (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, NODE_ENV, PORT) | `.env.example` (new) |
| 4 | Add startup script that runs `drizzle-kit push` (or migration) before starting server, ensuring DB schema is current | `scripts/start.sh` (new), update `package.json` scripts |
| 5 | Add SEO `<meta>` tags per route using React Router's `meta` export — title, description, OG tags for `/`, `/feed`, `/leaderboard`, `/stats`, `/wall-of-waste`, `/burn` | All route files |
| 6 | Add `robots.txt` and `sitemap.xml` resource routes | `app/routes/robots[.]txt.ts`, `app/routes/sitemap[.]xml.ts` (new) |

**Notes:**
- SQLite DB must persist across container restarts → Docker named volume on `data/`
- `.dockerignore` to exclude `node_modules`, `.env`, `data/waste.db`
- Health check endpoint (optional): simple `GET /api/health` returning 200

---

## Route Map

| Route               | Status  | Description                     |
| ------------------- | ------- | ------------------------------- |
| `/`                 | Done    | Landing page (real DB data)     |
| `/feed`             | Done    | Live waste feed (real DB data)  |
| `/leaderboard`      | Done    | Top wasters (real DB data)      |
| `/stats`            | Done    | Global charts (real DB data)    |
| `/wall-of-waste`    | Done    | Hall of fame (real DB data)     |
| `/burn`             | Done    | Razorpay checkout flow          |
| `/burn/verify`      | Done    | Payment signature verification  |
| `/burn/success`     | Done    | Post-payment confirmation       |
| `/burn/cancel`      | Done    | Payment cancelled               |
| `/api/stream`       | Done    | SSE endpoint for live updates   |
| `/burn/receipt/:id` | Done    | Shareable burn receipt card      |
| `/robots.txt`       | Done    | SEO robots file                 |
| `/sitemap.xml`      | Done    | SEO sitemap                     |

---

## File Structure (Current + Planned)

```
app/
├── app.css                    # Tailwind theme, custom utilities, animations
├── root.tsx                   # Layout, fonts, error boundary
├── routes.ts                  # Route configuration
├── lib/
│   ├── db.server.ts           # Drizzle client singleton (WAL mode)
│   ├── schema.server.ts       # Drizzle table definitions
│   ├── utils.ts               # formatCurrency, formatINR, WASTE_METHODS, cn(), etc.
│   ├── queries.server.ts      # All Drizzle DB queries (feed, leaderboard, stats, etc.)
│   ├── razorpay.server.ts     # Razorpay client + signature verification
│   ├── rate-limit.server.ts   # In-memory IP rate limiter (10/hr)
│   ├── use-live-data.ts       # useEventSource hook for SSE live updates
│   └── dummy-data.ts          # Static dummy data (legacy, no longer imported by routes)
└── routes/
    ├── landing.tsx            # Done — live counter via SSE
    ├── feed.tsx               # Done — live prepend via SSE
    ├── leaderboard.tsx        # Done
    ├── stats.tsx              # Done
    ├── wall-of-waste.tsx      # Done
    ├── burn.tsx               # Done — Razorpay checkout flow
    ├── burn-verify.tsx        # Done — Payment verification API
    ├── burn-success.tsx       # Done — Post-payment confirmation + share buttons
    ├── burn-cancel.tsx        # Done — Payment cancelled
    ├── burn-receipt.tsx       # Done — Shareable receipt card with OG tags
    ├── api.stream.ts          # Done — SSE resource route for live updates
    ├── robots[.]txt.ts        # Done — SEO robots.txt
    └── sitemap[.]xml.ts       # Done — SEO sitemap
data/
└── waste.db                   # SQLite database (gitignored)
scripts/
├── seed.ts                    # DB seed script
└── start.sh                   # Done — Startup script (migrate + serve)
Dockerfile                     # Done — Multi-stage production build
docker-compose.yml             # Done — Service + volume config
.env.example                   # Done — Documented env template
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
