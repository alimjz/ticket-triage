import { format } from "date-fns";
import type { TicketPriority, TicketStatus } from "@/convex/schema";

export type { TicketPriority, TicketStatus };

type Meta = {
  label: string;
  hint: string;
  badge: string;
};

export const STATUS_META: Record<TicketStatus, Meta> = {
  open: {
    label: "Open",
    hint: "Logged, nobody has picked it up yet",
    badge: "border-transparent bg-primary/14 text-primary",
  },
  pending: {
    label: "Waiting",
    hint: "Replied to, waiting on the requester",
    badge:
      "border-transparent bg-amber-500/14 text-amber-700 dark:text-amber-300",
  },
  resolved: {
    label: "Resolved",
    hint: "Handled and confirmed",
    badge:
      "border-transparent bg-emerald-500/14 text-emerald-700 dark:text-emerald-300",
  },
  closed: {
    label: "Closed",
    hint: "Archived, kept for the record",
    badge: "border-transparent bg-muted text-muted-foreground",
  },
};

export const PRIORITY_META: Record<TicketPriority, Meta> = {
  low: {
    label: "Low",
    hint: "Whenever there is room",
    badge: "border-transparent bg-muted text-muted-foreground",
  },
  normal: {
    label: "Normal",
    hint: "Standard queue order",
    badge: "border-transparent bg-sky-500/14 text-sky-700 dark:text-sky-300",
  },
  high: {
    label: "High",
    hint: "Blocking someone today",
    badge:
      "border-transparent bg-orange-500/14 text-orange-700 dark:text-orange-300",
  },
  urgent: {
    label: "Urgent",
    hint: "Stop everything else",
    badge: "border-transparent bg-destructive/16 text-destructive",
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

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
