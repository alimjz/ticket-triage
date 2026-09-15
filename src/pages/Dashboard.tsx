import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import {
  PRIORITY_META,
  STATUS_META,
  formatDayLabel,
  formatMinutes,
  timeAgo,
} from "@/lib/tickets";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Inbox,
  Loader2,
  Sparkles,
  TimerReset,
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

const ACCENT = "oklch(0.523 0.166 268)";

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: typeof Inbox;
  tone: "primary" | "amber" | "danger" | "emerald";
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    amber: "bg-amber-500/12 text-amber-600",
    danger: "bg-destructive/12 text-destructive",
    emerald: "bg-emerald-500/12 text-emerald-600",
  } as const;

  return (
    <Card className="gap-4 rounded-2xl border-border/70 py-5 shadow-sm">
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-muted-foreground">
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
          <p className="text-3xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TicketRow({
  ticket,
}: {
  ticket: {
    _id: string;
    reference: string;
    subject: string;
    customerName: string;
    status: keyof typeof STATUS_META;
    priority: keyof typeof PRIORITY_META;
    lastActivityAt: number;
  };
}) {
  const status = STATUS_META[ticket.status];
  const priority = PRIORITY_META[ticket.priority];

  return (
    <Link
      to={`/dashboard/tickets/${ticket._id}`}
      className="flex items-start justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-muted/50"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{ticket.subject}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="font-mono">{ticket.reference}</span>
          <span aria-hidden>·</span>
          <span className="truncate">{ticket.customerName}</span>
          <span aria-hidden>·</span>
          <span>{timeAgo(ticket.lastActivityAt)}</span>
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <Badge className={priority.badge}>{priority.label}</Badge>
        <Badge className={status.badge}>{status.label}</Badge>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const stats = useQuery(api.tickets.stats);
  const seedSampleTickets = useMutation(api.tickets.seedSampleTickets);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const result = await seedSampleTickets({});
      toast(
        result.inserted > 0
          ? `Loaded ${result.inserted} sample tickets`
          : "Your queue already has tickets",
      );
    } catch {
      toast.error("Could not load sample tickets");
    } finally {
      setIsSeeding(false);
    }
  };

  if (stats === undefined) {
    return (
      <AppShell
        title="Overview"
        description="How your support queue is doing right now."
      >
        <div className="flex h-64 items-center justify-center rounded-2xl border border-border/70 bg-card">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  const hasTickets = stats.total > 0;

  return (
    <AppShell
      title="Overview"
      description="How your support queue is doing right now."
      actions={
        <>
          <Button asChild variant="outline" className="gap-2 bg-card">
            <Link to="/submit">Customer form</Link>
          </Button>
          <Button asChild className="gap-2 shadow-sm">
            <Link to="/dashboard/tickets">
              Open queue
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </>
      }
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {!hasTickets ? (
          <Card className="relative overflow-hidden rounded-2xl border-border/70 border-dashed shadow-sm">
            <div className="pointer-events-none absolute -top-16 left-1/2 h-48 w-[32rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[90px]" />
            <CardContent className="relative flex flex-col items-start gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="size-5" />
                </span>
                <h2 className="mt-4 text-lg font-semibold tracking-tight">
                  Your queue is empty — see it working with sample data
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Load ten realistic tickets to preview triage, replies, and the
                  stats below. Sample data is only added when the queue is
                  empty.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleSeed}
                  disabled={isSeeding}
                  className="gap-2 shadow-sm"
                >
                  {isSeeding ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  Load sample tickets
                </Button>
                <Button asChild variant="outline" className="bg-card">
                  <Link to="/submit">Open customer form</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Open tickets"
            value={stats.open}
            hint="Waiting on a first reply"
            icon={Inbox}
            tone="primary"
          />
          <StatCard
            label="Waiting on customer"
            value={stats.pending}
            hint="You've replied already"
            icon={Clock}
            tone="amber"
          />
          <StatCard
            label="Needs attention"
            value={stats.needingAttention}
            hint="High or urgent, still open"
            icon={AlertTriangle}
            tone="danger"
          />
          <StatCard
            label="Resolved this week"
            value={stats.resolvedThisWeek}
            hint="Closed in the last 7 days"
            icon={CheckCircle2}
            tone="emerald"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Ticket volume</CardTitle>
              <CardDescription>
                New tickets per day over the last two weeks
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
                      stroke="rgba(122,131,163,0.18)"
                    />
                    <XAxis
                      dataKey="day"
                      tickFormatter={formatDayLabel}
                      tickLine={false}
                      axisLine={false}
                      interval={1}
                      tick={{ fontSize: 11, fill: "#8b90a5" }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      width={28}
                      tick={{ fontSize: 11, fill: "#8b90a5" }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(122,131,163,0.1)" }}
                      labelFormatter={(label) => formatDayLabel(String(label))}
                      formatter={(value) => [`${value} tickets`, "New"]}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid rgba(122,131,163,0.25)",
                        boxShadow: "0 12px 30px -18px rgba(20,24,45,0.45)",
                        fontSize: 12,
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
              <CardTitle className="text-base">Queue snapshot</CardTitle>
              <CardDescription>
                {stats.queue.length > 0
                  ? "Unresolved tickets, most recent activity first"
                  : "Nothing unresolved right now"}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 py-0">
              {stats.queue.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                  <CheckCircle2 className="size-6 text-emerald-600" />
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
              <div className="border-t border-border/70 px-5 py-3">
                <Link
                  to="/dashboard/tickets"
                  className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  View all tickets
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Response health</CardTitle>
              <CardDescription>Derived from every ticket on record</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  icon: TimerReset,
                  label: "Average first reply",
                  value: formatMinutes(stats.avgFirstReplyMinutes),
                },
                {
                  icon: Clock,
                  label: "Oldest unreplied ticket",
                  value: stats.oldestOpenAt
                    ? timeAgo(stats.oldestOpenAt)
                    : "Nothing open",
                },
                {
                  icon: Inbox,
                  label: "Tickets on record",
                  value: `${stats.total}`,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/30 px-4 py-3"
                >
                  <span className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
                    <row.icon className="size-4" />
                    {row.label}
                  </span>
                  <span className="text-[13px] font-semibold tabular-nums">
                    {row.value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm">
            <CardHeader className="gap-0 border-b border-border/70 py-5">
              <CardTitle className="text-base">Latest activity</CardTitle>
              <CardDescription>
                The five most recently touched tickets
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 py-0">
              {stats.recent.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                  No ticket activity yet.
                </p>
              ) : (
                <div className="divide-y divide-border/70">
                  {stats.recent.map((ticket) => (
                    <TicketRow key={ticket._id} ticket={ticket} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
