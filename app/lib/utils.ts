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
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompactCurrency(amount: number): string {
  if (amount >= 1_00_00_000) return `₹${(amount / 1_00_00_000).toFixed(1)}Cr`;
  if (amount >= 1_00_000) return `₹${(amount / 1_00_000).toFixed(1)}L`;
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(1)}K`;
  return formatCurrency(amount);
}

export function formatBigCounter(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
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

export const MONEY_TYPES = {
  coin:    { label: "Loose Change", icon: "🪙", color: "#CD7F32", verb: "tossed away",   min: 1,      max: 99 },
  note:    { label: "Paper Trail",  icon: "💵", color: "#22C55E", verb: "crumpled up",    min: 100,    max: 499 },
  splash:  { label: "Cash Splash",  icon: "💸", color: "#3B82F6", verb: "splashed away",  min: 500,    max: 999 },
  bag:     { label: "Money Bag",    icon: "💰", color: "#F59E0B", verb: "dumped",          min: 1000,   max: 4999 },
  fire:    { label: "Bonfire",      icon: "🔥", color: "#FF4500", verb: "incinerated",    min: 5000,   max: 24999 },
  diamond: { label: "Diamond Burn", icon: "💎", color: "#A855F7", verb: "obliterated",    min: 25000,  max: 99999 },
  crown:   { label: "Royal Waste",  icon: "👑", color: "#FFB800", verb: "detonated",      min: 100000, max: Infinity },
} as const;

export type MoneyType = keyof typeof MONEY_TYPES;

export function getMoneyType(amount: number) {
  for (const [, info] of Object.entries(MONEY_TYPES)) {
    if (amount >= info.min && amount <= info.max) return info;
  }
  return MONEY_TYPES.coin;
}

export function getMoneyTypeKey(amount: number): MoneyType {
  for (const [key, info] of Object.entries(MONEY_TYPES)) {
    if (amount >= info.min && amount <= info.max) return key as MoneyType;
  }
  return "coin";
}
