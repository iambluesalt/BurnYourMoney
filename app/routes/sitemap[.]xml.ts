export function loader() {
  const baseUrl = "https://burnyourmoney.com";
  const routes = [
    { path: "/", priority: "1.0", changefreq: "hourly" },
    { path: "/feed", priority: "0.9", changefreq: "always" },
    { path: "/leaderboard", priority: "0.8", changefreq: "hourly" },
    { path: "/analytics", priority: "0.7", changefreq: "daily" },
    { path: "/burn", priority: "0.9", changefreq: "monthly" },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) => `  <url>
    <loc>${baseUrl}${r.path}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
