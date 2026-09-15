import { AppShell } from "@/components/AppShell";
import { AssigneeSelect } from "@/components/AssigneeSelect";
import { TicketRow } from "@/components/TicketRow";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TicketPriority, TicketStatus } from "@/convex/schema";
import { useTeamMembers } from "@/hooks/use-team-members";
import { errorMessage } from "@/lib/errors";
import {
  PRIORITY_META,
  PRIORITY_ORDER,
  STATUS_META,
  STATUS_ORDER,
  formatDayLabel,
  formatMinutes,
  timeAgo,
} from "@/lib/tickets";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Inbox,
  Loader2,
  Plus,
  Sparkles,
  TimerReset,
  Trash2,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

const ACCENT = "oklch(0.68 0.133 254)";

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  tone: "primary" | "amber" | "danger" | "emerald";
}) {
  const tones = {
    primary: "bg-primary/12 text-primary",
    amber: "bg-amber-500/14 text-amber-600 dark:text-amber-300",
    danger: "bg-destructive/14 text-destructive",
    emerald: "bg-emerald-500/14 text-emerald-600 dark:text-emerald-300",
  } as const;

  return (
    <Card className="gap-4 rounded-2xl border-border/70 py-5 shadow-sm">
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </span>
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-lg",
              tones[tone],
            )}
          >
            <Icon className="size-4" />
          </span>
        </div>
        <div>
          <p className="font-mono text-3xl font-medium tabular-nums">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Admin() {
  const stats = useQuery(api.tickets.stats);
  const tickets = useQuery(api.tickets.listTickets, {});
  const updateTicket = useMutation(api.tickets.updateTicket);
  const deleteTicket = useMutation(api.tickets.deleteTicket);
  const seedSampleTickets = useMutation(api.tickets.seedSampleTickets);
  const members = useTeamMembers();
  const [isSeeding, setIsSeeding] = useState(false);

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

  const handleStatus = async (ticketId: Id<"tickets">, status: TicketStatus) => {
    try {
      await updateTicket({ ticketId, status });
      toast.success(`Status set to ${STATUS_META[status].label.toLowerCase()}`);
    } catch (caught) {
      toast.error(errorMessage(caught, "Could not update the status."));
    }
  };

  const handlePriority = async (
    ticketId: Id<"tickets">,
    priority: TicketPriority,
  ) => {
    try {
      await updateTicket({ ticketId, priority });
      toast.success(
        `Priority set to ${PRIORITY_META[priority].label.toLowerCase()}`,
      );
    } catch (caught) {
      toast.error(errorMessage(caught, "Could not update the priority."));
    }
  };

  const handleAssignee = async (
    ticketId: Id<"tickets">,
    assigneeId: Id<"users"> | null,
  ) => {
    try {
      await updateTicket({ ticketId, assigneeId });
      toast.success(assigneeId ? "Owner updated" : "Owner cleared");
    } catch (caught) {
      toast.error(errorMessage(caught, "Could not change the owner."));
    }
  };

  const handleDelete = async (ticketId: Id<"tickets">, reference: string) => {
    try {
      await deleteTicket({ ticketId });
      toast.success(`Deleted ${reference}`);
    } catch (caught) {
      toast.error(errorMessage(caught, "Could not delete that ticket."));
    }
  };

  if (stats === undefined) {
    return (
      <AppShell
        title="Admin"
        description="Team-wide numbers and every ticket, editable in place."
      >
        <div className="flex h-64 items-center justify-center rounded-2xl border border-border/70 bg-card">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Admin"
      description="Team-wide numbers and every ticket, editable in place."
      actions={
        <>
          <Button asChild variant="outline" className="bg-card">
            <Link to="/catalog">Catalog</Link>
          </Button>
          <Button asChild className="gap-2">
            <Link to="/new">
              <Plus className="size-4" />
              New ticket
            </Link>
          </Button>
        </>
      }
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {stats.total === 0 ? (
          <Card className="rounded-2xl border-dashed border-border/70 shadow-sm">
            <CardContent className="flex flex-col items-start gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <span className="flex size-10 items-center justify-center rounded-xl border border-border/70 bg-primary/10 text-primary">
                  <Sparkles className="size-5" />
                </span>
                <h2 className="mt-4 text-lg font-semibold tracking-tight">
                  The workspace is empty
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Load ten realistic tickets to see the stats, the queue, and the
                  comment threads working. Sample data is only added when the
                  catalog has no tickets.
                </p>
              </div>
              <Button
                onClick={handleSeed}
                disabled={isSeeding}
                className="gap-2"
              >
                {isSeeding ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                Load sample tickets
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Open"
            value={stats.open}
            hint="Nobody has replied yet"
            icon={Inbox}
            tone="primary"
          />
          <StatCard
            label="Waiting"
            value={stats.pending}
            hint="Replied, waiting on the requester"
            icon={Clock}
            tone="amber"
          />
          <StatCard
            label="Needs attention"
            value={stats.needingAttention}
            hint="High or urgent, still unresolved"
            icon={AlertTriangle}
            tone="danger"
          />
          <StatCard
            label="Resolved this week"
            value={stats.resolvedThisWeek}
            hint="Closed out in the last 7 days"
            icon={CheckCircle2}
            tone="emerald"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Ticket volume</CardTitle>
              <CardDescription>
                Tickets logged per day over the last two weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.activity}
                    margin={{ top: 4, right: 4, bottom: 0, left: -18 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="rgba(255,255,255,0.07)"
                    />
                    <XAxis
                      dataKey="day"
                      tickFormatter={formatDayLabel}
                      tickLine={false}
                      axisLine={false}
                      interval={1}
                      tick={{ fontSize: 11, fill: "#7d8598" }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      width={28}
                      tick={{ fontSize: 11, fill: "#7d8598" }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.05)" }}
                      labelFormatter={(label) => formatDayLabel(String(label))}
                      formatter={(value) => [`${value} tickets`, "Logged"]}
                      contentStyle={{
                        background: "oklch(0.216 0.007 265)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 12,
                        fontSize: 12,
                        color: "#e9ebf2",
                      }}
                    />
                    <Bar
                      dataKey="tickets"
                      fill={ACCENT}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={26}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm">
            <CardHeader className="gap-0 border-b border-border/70 py-5">
              <CardTitle className="text-base">Queue</CardTitle>
              <CardDescription>
                {stats.queue.length > 0
                  ? "Unresolved tickets, most recent activity first"
                  : "Nothing unresolved right now"}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 py-0">
              {stats.queue.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                  <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm font-medium">Queue is clear</p>
                  <p className="text-xs text-muted-foreground">
                    Every ticket is resolved or closed.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/70">
                  {stats.queue.map((ticket) => (
                    <TicketRow key={ticket._id} ticket={ticket} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Response health</CardTitle>
            <CardDescription>
              Derived from every ticket on record
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: TimerReset,
                label: "Median first response",
                value: formatMinutes(stats.avgFirstResponseMinutes),
              },
              {
                icon: Clock,
                label: "Oldest unreplied ticket",
                value: stats.oldestOpenAt ? timeAgo(stats.oldestOpenAt) : "None",
              },
              {
                icon: Inbox,
                label: "Tickets on record",
                value: `${stats.total}`,
              },
              {
                icon: UserRound,
                label: "Unassigned",
                value: `${stats.unassigned}`,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3"
              >
                <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  <row.icon className="size-3.5" />
                  {row.label}
                </span>
                <p className="mt-1.5 font-mono text-xl font-medium tabular-nums">
                  {row.value}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm">
          <CardHeader className="gap-0 border-b border-border/70 py-5">
            <CardTitle className="text-base">All tickets</CardTitle>
            <CardDescription>
              Change status or priority inline, or delete what does not belong
              here
            </CardDescription>
          </CardHeader>

          {tickets === undefined ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : tickets.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              No tickets to manage yet.
            </p>
          ) : (
            <CardContent className="divide-y divide-border/70 px-0 py-0">
              {tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/catalog/${ticket._id}`}
                      className="truncate text-sm font-medium hover:underline"
                    >
                      {ticket.subject}
                    </Link>
                    <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                      {ticket.reference}
                      <span className="px-1.5 font-sans text-border">/</span>
                      <span className="font-sans">{ticket.customerName}</span>
                      <span className="px-1.5 font-sans text-border">/</span>
                      <span
                        className={cn(
                          "font-sans",
                          !ticket.assigneeName &&
                            "italic text-muted-foreground/70",
                        )}
                      >
                        {ticket.assigneeName
                          ? `@${ticket.assigneeName}`
                          : "unassigned"}
                      </span>
                      <span className="px-1.5 font-sans text-border">/</span>
                      <span className="font-sans">
                        {timeAgo(ticket.lastActivityAt)}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <AssigneeSelect
                      members={members}
                      value={ticket.assigneeId}
                      onChange={(assigneeId) =>
                        handleAssignee(ticket._id, assigneeId)
                      }
                      size="sm"
                      className="w-[150px] bg-card"
                    />

                    <Select
                      value={ticket.status}
                      onValueChange={(value) =>
                        handleStatus(ticket._id, value as TicketStatus)
                      }
                    >
                      <SelectTrigger size="sm" className="w-[130px] bg-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_ORDER.map((value) => (
                          <SelectItem key={value} value={value}>
                            {STATUS_META[value].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={ticket.priority}
                      onValueChange={(value) =>
                        handlePriority(ticket._id, value as TicketPriority)
                      }
                    >
                      <SelectTrigger size="sm" className="w-[120px] bg-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_ORDER.map((value) => (
                          <SelectItem key={value} value={value}>
                            {PRIORITY_META[value].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${ticket.reference}`}
                          className="size-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border-border/70">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete {ticket.reference}?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            “{ticket.subject}” and its comments and attachments
                            will be removed for everyone. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep it</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleDelete(ticket._id, ticket.reference)
                            }
                            className="bg-destructive text-white hover:bg-destructive/90"
                          >
                            Delete ticket
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
