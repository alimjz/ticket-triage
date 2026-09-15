import { format } from "date-fns";
import type { TicketPriority, TicketStatus } from "@/convex/schema";

export type { TicketPriority, TicketStatus };

type Meta = {
  label: string;
  hint: string;
  badge: string;
  dot: string;
};

export const STATUS_META: Record<TicketStatus, Meta> = {
  open: {
    label: "Open",
    hint: "Needs a first reply",
    badge: "border-transparent bg-primary/10 text-primary",
    dot: "bg-primary",
  },
  pending: {
    label: "Waiting",
    hint: "Replied, waiting on the customer",
    badge:
      "border-transparent bg-amber-500/12 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  resolved: {
    label: "Resolved",
    hint: "Answered and confirmed",
    badge:
      "border-transparent bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  closed: {
    label: "Closed",
    hint: "Archived, no longer active",
    badge: "border-transparent bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/50",
  },
};

export const PRIORITY_META: Record<TicketPriority, Meta> = {
  low: {
    label: "Low",
    hint: "Whenever there is time",
    badge: "border-transparent bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/50",
  },
  normal: {
    label: "Normal",
    hint: "Standard queue",
    badge: "border-transparent bg-sky-500/12 text-sky-700 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  high: {
    label: "High",
    hint: "Affects their work today",
    badge:
      "border-transparent bg-orange-500/12 text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  urgent: {
    label: "Urgent",
    hint: "Blocked or losing money",
    badge: "border-transparent bg-destructive/12 text-destructive",
    dot: "bg-destructive",
  },
};

export const STATUS_ORDER: TicketStatus[] = [
  "open",
  "pending",
  "resolved",
  "closed",
];

export const PRIORITY_ORDER: TicketPriority[] = [
  "urgent",
  "high",
  "normal",
  "low",
];

export function timeAgo(timestamp: number) {
  const minutes = Math.round((Date.now() - timestamp) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return format(timestamp, "MMM d");
}

export function formatDateTime(timestamp: number) {
  return format(timestamp, "MMM d, yyyy 'at' h:mm a");
}

export function formatDayLabel(day: string) {
  const [year, month, date] = day.split("-").map(Number);
  return format(new Date(year, month - 1, date), "MMM d");
}

export function formatMinutes(minutes: number | null) {
  if (minutes === null) return "—";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours < 24) return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
  return `${Math.round(hours / 24)}d`;
}
