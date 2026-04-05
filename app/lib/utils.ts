import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompactCurrency(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return formatCurrency(amount);
}

export function formatBigCounter(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export const WASTE_METHODS = {
  burn: { label: "Burned", icon: "🔥", color: "#FF4500", verb: "burned" },
  shred: { label: "Shredded", icon: "🗑️", color: "#FF6B35", verb: "shredded" },
  flush: { label: "Flushed", icon: "🚽", color: "#3B82F6", verb: "flushed" },
  yeet: { label: "Yeeted", icon: "🚀", color: "#A855F7", verb: "yeeted" },
  blackhole: { label: "Black Holed", icon: "🕳️", color: "#6366F1", verb: "sent to the void" },
  feed: { label: "Fed to Void", icon: "👹", color: "#10B981", verb: "fed to the void" },
} as const;

export type WasteMethod = keyof typeof WASTE_METHODS;

export function getMethodInfo(method: WasteMethod) {
  return WASTE_METHODS[method];
}
