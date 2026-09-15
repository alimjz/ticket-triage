import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import type { TicketPriority, TicketStatus } from "@/convex/schema";
import { PRIORITY_META, PRIORITY_ORDER, STATUS_META, timeAgo } from "@/lib/tickets";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { Inbox, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

type StatusFilter = "all" | TicketStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "pending", label: "Waiting" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function Tickets() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [priority, setPriority] = useState<"all" | TicketPriority>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(timer);
  }, [search]);

  const tickets = useQuery(api.tickets.listTickets, {
    status,
    priority,
    search: debouncedSearch,
  });
  const stats = useQuery(api.tickets.stats);

  const counts: Record<StatusFilter, number | undefined> = {
    all: stats?.total,
    open: stats?.open,
    pending: stats?.pending,
    resolved: stats?.resolved,
    closed: stats?.closed,
  };

  const isFiltered =
    status !== "all" || priority !== "all" || debouncedSearch.trim().length > 0;

  return (
    <AppShell
      title="Tickets"
      description="Triage, prioritise, and reply to every customer request."
      actions={
        <Button asChild variant="outline" className="gap-2 bg-card">
          <Link to="/submit">Customer form</Link>
        </Button>
      }
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatus(filter.value)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                  status === filter.value
                    ? "border-transparent bg-primary text-primary-foreground shadow-sm"
                    : "border-border/70 bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {filter.label}
                {counts[filter.value] !== undefined ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[11px] tabular-nums",
                      status === filter.value
                        ? "bg-primary-foreground/20"
                        : "bg-muted",
                    )}
                  >
                    {counts[filter.value]}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search subject, customer, reference"
                className="h-9 w-full bg-card pl-9 sm:w-72"
              />
            </div>
            <Select
              value={priority}
              onValueChange={(value) =>
                setPriority(value as "all" | TicketPriority)
              }
            >
              <SelectTrigger className="h-9 w-full bg-card sm:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {PRIORITY_ORDER.map((value) => (
                  <SelectItem key={value} value={value}>
                    {PRIORITY_META[value].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm">
          <div className="hidden items-center gap-4 border-b border-border/70 bg-muted/40 px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground md:flex">
            <span className="flex-1">Ticket</span>
            <span className="w-48">Customer</span>
            <span className="w-24 text-right">Priority</span>
            <span className="w-24 text-right">Status</span>
            <span className="w-24 text-right">Updated</span>
          </div>

          {tickets === undefined ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
              <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Inbox className="size-5" />
              </span>
              <p className="mt-1 text-sm font-medium">
                {isFiltered ? "No tickets match these filters" : "No tickets yet"}
              </p>
              <p className="max-w-sm text-xs leading-5 text-muted-foreground">
                {isFiltered
                  ? "Try clearing the search or switching back to all statuses."
                  : "Share the customer form and incoming requests will show up here."}
              </p>
              {isFiltered ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 bg-card"
                  onClick={() => {
                    setStatus("all");
                    setPriority("all");
                    setSearch("");
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Button asChild size="sm" className="mt-3">
                  <Link to="/submit">Open customer form</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/70">
              {tickets.map((ticket) => {
                const statusMeta = STATUS_META[ticket.status];
                const priorityMeta = PRIORITY_META[ticket.priority];
                return (
                  <Link
                    key={ticket._id}
                    to={`/dashboard/tickets/${ticket._id}`}
                    className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/40 md:flex-row md:items-center md:gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {ticket.subject}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        <span className="font-mono">{ticket.reference}</span>
                        {" · "}
                        {ticket.lastMessagePreview}
                      </p>
                    </div>
                    <div className="min-w-0 md:w-48">
                      <p className="truncate text-[13px]">{ticket.customerName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {ticket.customerEmail}
                      </p>
                    </div>
                    <div className="md:w-24 md:text-right">
                      <Badge className={priorityMeta.badge}>
                        {priorityMeta.label}
                      </Badge>
                    </div>
                    <div className="md:w-24 md:text-right">
                      <Badge className={statusMeta.badge}>
                        {statusMeta.label}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground md:w-24 md:text-right">
                      {timeAgo(ticket.lastActivityAt)}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        {tickets !== undefined && tickets.length > 0 ? (
          <p className="px-1 text-xs text-muted-foreground">
            Showing {tickets.length} ticket{tickets.length === 1 ? "" : "s"}
            {isFiltered ? " matching your filters" : ""}.
          </p>
        ) : null}
      </div>
    </AppShell>
  );
}
