import { Badge } from "@/components/ui/badge";
import {
  PRIORITY_META,
  STATUS_META,
  timeAgo,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/tickets";
import { cn } from "@/lib/utils";
import { Link } from "react-router";

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <Badge className={STATUS_META[status].badge}>
      {STATUS_META[status].label}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <Badge className={PRIORITY_META[priority].badge}>
      {PRIORITY_META[priority].label}
    </Badge>
  );
}

export type TicketRowTicket = {
  _id: string;
  reference: string;
  subject: string;
  customerName: string;
  assigneeName?: string;
  status: TicketStatus;
  priority: TicketPriority;
  lastActivityAt: number;
};

export function TicketRow({
  ticket,
  className,
}: {
  ticket: TicketRowTicket;
  className?: string;
}) {
  return (
    <Link
      to={`/catalog/${ticket._id}`}
      className={cn(
        "flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-foreground/[0.03]",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{ticket.subject}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="font-mono text-[11px]">{ticket.reference}</span>
          <span className="text-border">/</span>
          <span className="truncate">{ticket.customerName}</span>
          <span className="text-border">/</span>
          <span
            className={cn(
              "truncate",
              !ticket.assigneeName && "italic text-muted-foreground/70",
            )}
          >
            {ticket.assigneeName ? `@${ticket.assigneeName}` : "unassigned"}
          </span>
          <span className="text-border">/</span>
          <span className="tabular-nums">{timeAgo(ticket.lastActivityAt)}</span>
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <PriorityBadge priority={ticket.priority} />
        <StatusBadge status={ticket.status} />
      </div>
    </Link>
  );
}
