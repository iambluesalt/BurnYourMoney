import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/landing.tsx"),
  route("feed", "routes/feed.tsx"),
  route("leaderboard", "routes/leaderboard.tsx"),
  route("stats", "routes/stats.tsx"),
  route("wall-of-waste", "routes/wall-of-waste.tsx"),
  route("burn", "routes/burn.tsx"),
  route("burn/verify", "routes/burn-verify.tsx"),
  route("burn/success", "routes/burn-success.tsx"),
  route("burn/cancel", "routes/burn-cancel.tsx"),
] satisfies RouteConfig;
