export function loader() {
  const content = `User-agent: *
Allow: /

Sitemap: https://wasteyourmoney.com/sitemap.xml
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
