import { AppShell } from "@/components/AppShell";
import { PriorityBadge, StatusBadge } from "@/components/TicketRow";
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
import { errorMessage } from "@/lib/errors";
import { PRIORITY_META, PRIORITY_ORDER, timeAgo } from "@/lib/tickets";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { Loader2, Plus, Search, Sparkles, Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

type StatusFilter = "all" | TicketStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "pending", label: "Waiting" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function Catalog() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [priority, setPriority] = useState<"all" | TicketPriority>("all");
  const [assignee, setAssignee] = useState<"any" | "me" | "unassigned">(
    "any",
  );
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSeeding, setIsSeeding] = useState(false);

  const seedSampleTickets = useMutation(api.tickets.seedSampleTickets);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(timer);
  }, [search]);

  const tickets = useQuery(api.tickets.listTickets, {
    status,
    priority,
    assignee,
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
    status !== "all" ||
    priority !== "all" ||
    assignee !== "any" ||
    debouncedSearch.trim().length > 0;

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const result = await seedSampleTickets({});
      toast(
        result.inserted > 0
          ? `Loaded ${result.inserted} sample tickets`
          : "The catalog already has tickets",
      );
    } catch (caught) {
      toast.error(errorMessage(caught, "Could not load sample tickets."));
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <AppShell
      title="Catalog"
      description="Every ticket the team has logged, searchable in one place."
      actions={
        <Button asChild className="gap-2">
          <Link to="/new">
            <Plus className="size-4" />
            New ticket
          </Link>
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
                    ? "border-primary/30 bg-primary/12 text-primary"
                    : "border-border/70 bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {filter.label}
                {counts[filter.value] !== undefined ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 font-mono text-[10px] tabular-nums",
                      status === filter.value
                        ? "bg-primary/15 text-primary"
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
                placeholder="Search title, reference, or requester"
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
            <Select
              value={assignee}
              onValueChange={(value) =>
                setAssignee(value as "any" | "me" | "unassigned")
              }
            >
              <SelectTrigger className="h-9 w-full bg-card sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any owner</SelectItem>
                <SelectItem value="me">Assigned to me</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm">
          <div className="hidden items-center gap-4 border-b border-border/70 bg-muted/20 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground md:flex">
            <span className="flex-1">Ticket</span>
            <span className="w-44">Owner</span>
            <span className="w-24 text-right">Priority</span>
            <span className="w-24 text-right">Status</span>
            <span className="w-20 text-right">Updated</span>
          </div>

          {tickets === undefined ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
              <span className="flex size-10 items-center justify-center rounded-xl border border-border/70 bg-muted/40 text-muted-foreground">
                <Layers className="size-5" />
              </span>
              <p className="mt-1 text-sm font-medium">
                {isFiltered
                  ? "No tickets match these filters"
                  : "Nothing in the catalog yet"}
              </p>
              <p className="max-w-sm text-xs leading-5 text-muted-foreground">
                {isFiltered
                  ? "Try a different status, priority, owner, or search term."
                  : "Log the first ticket, or load a sample queue to see how triage works."}
              </p>
              {isFiltered ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 bg-card"
                  onClick={() => {
                    setStatus("all");
                    setPriority("all");
                    setAssignee("any");
                    setSearch("");
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <Button asChild size="sm" className="gap-1.5">
                    <Link to="/new">
                      <Plus className="size-3.5" />
                      New ticket
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 bg-card"
                    onClick={handleSeed}
                    disabled={isSeeding}
                  >
                    {isSeeding ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="size-3.5" />
                    )}
                    Load sample tickets
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/70">
              {tickets.map((ticket) => (
                <Link
                  key={ticket._id}
                  to={`/catalog/${ticket._id}`}
                  className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-foreground/[0.03] md:flex-row md:items-center md:gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {ticket.subject}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      <span className="font-mono text-[11px]">
                        {ticket.reference}
                      </span>
                      <span className="px-1.5 text-border">/</span>
                      {ticket.lastMessagePreview}
                    </p>
                  </div>
                  <div className="min-w-0 md:w-44">
                    <p
                      className={cn(
                        "truncate text-[13px]",
                        !ticket.assigneeName && "italic text-muted-foreground",
                      )}
                    >
                      {ticket.assigneeName ?? "Unassigned"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      logged by {ticket.customerName}
                    </p>
                  </div>
                  <div className="md:w-24 md:text-right">
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                  <div className="md:w-24 md:text-right">
                    <StatusBadge status={ticket.status} />
                  </div>
                  <div className="font-mono text-[11px] tabular-nums text-muted-foreground md:w-20 md:text-right">
                    {timeAgo(ticket.lastActivityAt)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {tickets !== undefined && tickets.length > 0 ? (
          <p className="px-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {tickets.length} ticket{tickets.length === 1 ? "" : "s"}
            {isFiltered ? " matching filters" : " on record"}
          </p>
        ) : null}
      </div>
    </AppShell>
  );
}
