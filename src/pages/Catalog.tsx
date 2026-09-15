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
import { useI18n } from "@/hooks/use-i18n";
import { errorMessage } from "@/lib/errors";
import type { MessageKey } from "@/lib/i18n";
import {
  PRIORITY_LABEL_KEY,
  PRIORITY_ORDER,
  STATUS_LABEL_KEY,
} from "@/lib/tickets";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { Layers, Loader2, Plus, Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

type StatusFilter = "all" | TicketStatus;

const STATUS_FILTERS: { value: StatusFilter; labelKey: MessageKey }[] = [
  { value: "all", labelKey: "filters.all" },
  { value: "open", labelKey: STATUS_LABEL_KEY.open },
  { value: "pending", labelKey: STATUS_LABEL_KEY.pending },
  { value: "resolved", labelKey: STATUS_LABEL_KEY.resolved },
  { value: "closed", labelKey: STATUS_LABEL_KEY.closed },
];

export default function Catalog() {
  const { t, timeAgo } = useI18n();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [priority, setPriority] = useState<"all" | TicketPriority>("all");
  const [assignee, setAssignee] = useState<"any" | "me" | "unassigned">("any");
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
          ? t("toasts.sampleLoaded", { count: result.inserted })
          : t("toasts.sampleExists"),
      );
    } catch (caught) {
      toast.error(errorMessage(caught, t("errors.loadSample")));
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <AppShell
      title={t("catalog.title")}
      description={t("catalog.description")}
      actions={
        <Button asChild className="gap-2">
          <Link to="/new">
            <Plus className="size-4" />
            {t("common.newTicket")}
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
                {t(filter.labelKey)}
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
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("catalog.search")}
                className="h-9 w-full bg-card ps-9 sm:w-72"
              />
            </div>
            <Select
              value={priority}
              onValueChange={(value) =>
                setPriority(value as "all" | TicketPriority)
              }
            >
              <SelectTrigger className="h-9 w-full bg-card sm:w-40">
                <SelectValue placeholder={t("catalog.columnPriority")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allPriorities")}</SelectItem>
                {PRIORITY_ORDER.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(PRIORITY_LABEL_KEY[value])}
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
                <SelectItem value="any">{t("filters.anyOwner")}</SelectItem>
                <SelectItem value="me">{t("filters.mine")}</SelectItem>
                <SelectItem value="unassigned">
                  {t("filters.unassigned")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm">
          <div className="hidden items-center gap-4 border-b border-border/70 bg-muted/20 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground md:flex">
            <span className="flex-1">{t("catalog.columnTicket")}</span>
            <span className="w-44">{t("catalog.columnOwner")}</span>
            <span className="w-24 text-end">{t("catalog.columnPriority")}</span>
            <span className="w-24 text-end">{t("catalog.columnStatus")}</span>
            <span className="w-20 text-end">{t("catalog.columnUpdated")}</span>
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
                {isFiltered ? t("catalog.emptyFiltered") : t("catalog.emptyNone")}
              </p>
              <p className="max-w-sm text-xs leading-5 text-muted-foreground">
                {isFiltered
                  ? t("catalog.emptyFilteredHint")
                  : t("catalog.emptyNoneHint")}
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
                  {t("filters.clear")}
                </Button>
              ) : (
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <Button asChild size="sm" className="gap-1.5">
                    <Link to="/new">
                      <Plus className="size-3.5" />
                      {t("common.newTicket")}
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
                    {t("catalog.loadSample")}
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
                      {ticket.assigneeName ?? t("common.unassigned")}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t("catalog.loggedBy", { name: ticket.customerName })}
                    </p>
                  </div>
                  <div className="md:w-24 md:text-end">
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                  <div className="md:w-24 md:text-end">
                    <StatusBadge status={ticket.status} />
                  </div>
                  <div className="font-mono text-[11px] tabular-nums text-muted-foreground md:w-20 md:text-end">
                    {timeAgo(ticket.lastActivityAt)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {tickets !== undefined && tickets.length > 0 ? (
          <p className="px-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {isFiltered
              ? t("catalog.matching", { count: tickets.length })
              : t("catalog.onRecord", { count: tickets.length })}
          </p>
        ) : null}
      </div>
    </AppShell>
  );
}
