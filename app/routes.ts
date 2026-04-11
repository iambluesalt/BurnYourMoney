import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/landing.tsx"),
  route("feed", "routes/feed.tsx"),
  route("leaderboard", "routes/leaderboard.tsx"),
  route("analytics", "routes/stats.tsx"),
  route("burn", "routes/burn.tsx"),
  route("burn/success", "routes/burn-success.tsx"),
  route("burn/verify", "routes/burn-verify.tsx"),
  route("burn/cancel", "routes/burn-cancel.tsx"),
  route("burn/receipt/:id", "routes/burn-receipt.tsx"),
  route("my-burns", "routes/my-burns.tsx"),
  route("terms", "routes/terms.tsx"),
  route("robots.txt", "routes/robots[.]txt.ts"),
  route("sitemap.xml", "routes/sitemap[.]xml.ts"),
] satisfies RouteConfig;
