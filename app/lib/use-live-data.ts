import { useEffect, useRef, useCallback, useState } from "react";
import type { WasteEventRow, PlatformStats } from "./queries.server";

interface LiveData {
  newEvents: WasteEventRow[];
  stats: PlatformStats | null;
}

export function useLiveData(initialStats: PlatformStats) {
  const [stats, setStats] = useState<PlatformStats>(initialStats);
  const [newEvents, setNewEvents] = useState<WasteEventRow[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const connect = useCallback(() => {
    if (typeof window === "undefined") return;

    // Clean up previous
    eventSourceRef.current?.close();

    const es = new EventSource("/api/stream");
    eventSourceRef.current = es;

    es.addEventListener("stats", (e) => {
      try {
        const data = JSON.parse(e.data) as PlatformStats;
        setStats(data);
      } catch { /* ignore parse errors */ }
    });

    es.addEventListener("new-events", (e) => {
      try {
        const data = JSON.parse(e.data) as WasteEventRow[];
        setNewEvents((prev) => [...data, ...prev]);
      } catch { /* ignore parse errors */ }
    });

    es.onerror = () => {
      es.close();
      // Reconnect after 5 seconds
      reconnectTimer.current = setTimeout(connect, 5000);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      eventSourceRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [connect]);

  // Allow clearing the new events queue (e.g., after merging into feed)
  const clearNewEvents = useCallback(() => setNewEvents([]), []);

  return { stats, newEvents, clearNewEvents };
}
