import { useState } from "react";

export interface PlatformStats {
  totalWasted: number;
  totalEvents: number;
  totalBurners: number;
}

// Static mode: no SSE, just return initial stats unchanged.
export function useLiveData(initialStats: PlatformStats) {
  const [stats] = useState<PlatformStats>(initialStats);
  return { stats, newEvents: [] as never[], clearNewEvents: () => {} };
}
