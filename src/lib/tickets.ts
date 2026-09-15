import type { MessageKey } from "@/lib/i18n";
import type { TicketPriority, TicketStatus } from "@/convex/schema";

export type { TicketPriority, TicketStatus };

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

export const STATUS_BADGE: Record<TicketStatus, string> = {
  open: "border-transparent bg-primary/14 text-primary",
  pending:
    "border-transparent bg-amber-500/14 text-amber-700 dark:text-amber-300",
  resolved:
    "border-transparent bg-emerald-500/14 text-emerald-700 dark:text-emerald-300",
  closed: "border-transparent bg-muted text-muted-foreground",
};

export const PRIORITY_BADGE: Record<TicketPriority, string> = {
  low: "border-transparent bg-muted text-muted-foreground",
  normal: "border-transparent bg-sky-500/14 text-sky-700 dark:text-sky-300",
  high: "border-transparent bg-orange-500/14 text-orange-700 dark:text-orange-300",
  urgent: "border-transparent bg-destructive/16 text-destructive",
};

export const STATUS_LABEL_KEY: Record<TicketStatus, MessageKey> = {
  open: "status.open.label",
  pending: "status.pending.label",
  resolved: "status.resolved.label",
  closed: "status.closed.label",
};

export const STATUS_HINT_KEY: Record<TicketStatus, MessageKey> = {
  open: "status.open.hint",
  pending: "status.pending.hint",
  resolved: "status.resolved.hint",
  closed: "status.closed.hint",
};

export const PRIORITY_LABEL_KEY: Record<TicketPriority, MessageKey> = {
  low: "priority.low.label",
  normal: "priority.normal.label",
  high: "priority.high.label",
  urgent: "priority.urgent.label",
};

export const PRIORITY_HINT_KEY: Record<TicketPriority, MessageKey> = {
  low: "priority.low.hint",
  normal: "priority.normal.hint",
  high: "priority.high.hint",
  urgent: "priority.urgent.hint",
};

/** File sizes read the same in both languages. */
export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
