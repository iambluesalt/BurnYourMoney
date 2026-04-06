import type { Route } from "./+types/api.stream";
import { getEventsSince, getPlatformStats } from "~/lib/queries.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const lastEventId = url.searchParams.get("lastEventId") || request.headers.get("Last-Event-ID");
  let cursor = lastEventId ? Number(lastEventId) : Date.now();

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      function send(event: string, data: unknown, id?: string) {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n`));
        if (id) controller.enqueue(encoder.encode(`id: ${id}\n`));
        controller.enqueue(encoder.encode("\n"));
      }

      // Send initial stats immediately
      const stats = getPlatformStats();
      send("stats", stats, String(cursor));

      const interval = setInterval(() => {
        try {
          const newEvents = getEventsSince(cursor);
          const currentStats = getPlatformStats();

          if (newEvents.length > 0) {
            cursor = new Date(newEvents[0].createdAt).getTime();
            send("new-events", newEvents, String(cursor));
          }

          send("stats", currentStats, String(cursor));
        } catch {
          // DB might be temporarily unavailable
        }
      }, 4000);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
