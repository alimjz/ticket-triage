import { AppShell } from "@/components/AppShell";
import { TicketRow } from "@/components/TicketRow";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useI18n } from "@/hooks/use-i18n";
import { errorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  Circle,
  ClipboardList,
  Clock3,
  Inbox,
  ListTodo,
  Loader2,
  Plus,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

function StatTile({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="gap-4 rounded-2xl border-border/70 py-5 shadow-sm">
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </span>
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div>
          <p className="font-mono text-3xl font-medium tabular-nums">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { t, timeAgo } = useI18n();
  const mine = useQuery(api.tickets.myDashboard);
  const todos = useQuery(api.todos.listMine);
  const stats = useQuery(api.tickets.stats);

  const createTodo = useMutation(api.todos.createTodo);
  const toggleTodo = useMutation(api.todos.toggleTodo);
  const deleteTodo = useMutation(api.todos.deleteTodo);

  const [draft, setDraft] = useState("");

  const handleAddTodo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = draft.trim();
    if (title.length < 2) return;
    try {
      await createTodo({ title });
      setDraft("");
    } catch (caught) {
      toast.error(errorMessage(caught, t("errors.addTodo")));
    }
  };

  const handleToggle = async (todoId: Id<"todos">, done: boolean) => {
    try {
      await toggleTodo({ todoId, done });
    } catch (caught) {
      toast.error(errorMessage(caught, t("errors.updateTodo")));
    }
  };

  const handleDelete = async (todoId: Id<"todos">) => {
    try {
      await deleteTodo({ todoId });
    } catch (caught) {
      toast.error(errorMessage(caught, t("errors.deleteTodo")));
    }
  };

  const teamTiles: { label: string; value: number; hint: string }[] = [
    {
      label: t("dashboard.teamOpen"),
      value: stats?.open ?? 0,
      hint: t("dashboard.teamOpenHint"),
    },
    {
      label: t("dashboard.teamWaiting"),
      value: stats?.pending ?? 0,
      hint: t("dashboard.teamWaitingHint"),
    },
    {
      label: t("dashboard.teamUrgent"),
      value: stats?.needingAttention ?? 0,
      hint: t("dashboard.teamUrgentHint"),
    },
    {
      label: t("dashboard.teamUnassigned"),
      value: stats?.unassigned ?? 0,
      hint: t("dashboard.teamUnassignedHint"),
    },
  ];

  return (
    <AppShell
      title={t("dashboard.title")}
      description={t("dashboard.description")}
      actions={
        <Button asChild className="gap-2">
          <Link to="/new">
            <Plus className="size-4" />
            {t("common.newTicket")}
          </Link>
        </Button>
      }
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label={t("dashboard.assignedToMe")}
            value={mine?.assignedCount ?? 0}
            hint={t("dashboard.assignedToMeHint")}
            icon={UserRound}
          />
          <StatTile
            label={t("dashboard.myOpen")}
            value={mine?.open ?? 0}
            hint={t("dashboard.myOpenHint")}
            icon={Inbox}
          />
          <StatTile
            label={t("dashboard.waiting")}
            value={mine?.waiting ?? 0}
            hint={t("dashboard.waitingHint")}
            icon={Clock3}
          />
          <StatTile
            label={t("dashboard.openTodos")}
            value={todos?.open ?? 0}
            hint={t("dashboard.openTodosHint")}
            icon={ListTodo}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm">
            <CardHeader className="gap-0 border-b border-border/70 py-5">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="size-4 text-muted-foreground" />
                {t("dashboard.assignedCard")}
              </CardTitle>
              <CardDescription>
                {mine && mine.assignedCount > 0
                  ? t("dashboard.assignedCount", {
                      count: mine.assignedCount,
                    })
                  : t("dashboard.assignedNone")}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 py-0">
              {mine === undefined ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : mine.assigned.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                  <span className="flex size-10 items-center justify-center rounded-xl border border-border/70 bg-muted/40 text-muted-foreground">
                    <UserRound className="size-5" />
                  </span>
                  <p className="mt-1 text-sm font-medium">
                    {t("dashboard.inboxZero")}
                  </p>
                  <p className="max-w-xs text-xs leading-5 text-muted-foreground">
                    {t("dashboard.inboxZeroHint")}
                  </p>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="mt-3 bg-card"
                  >
                    <Link to="/catalog">{t("dashboard.findWork")}</Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border/70">
                  {mine.assigned.map((ticket) => (
                    <TicketRow key={ticket._id} ticket={ticket} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm">
            <CardHeader className="gap-0 border-b border-border/70 py-5">
              <CardTitle className="text-base">
                {t("dashboard.myTickets")}
              </CardTitle>
              <CardDescription>
                {mine && mine.total > 0
                  ? t("dashboard.myTicketsTotal", {
                      total: mine.total,
                      done: mine.done,
                    })
                  : t("dashboard.myTicketsNone")}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 py-0">
              {mine === undefined ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : mine.tickets.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                  <span className="flex size-10 items-center justify-center rounded-xl border border-border/70 bg-muted/40 text-muted-foreground">
                    <Inbox className="size-5" />
                  </span>
                  <p className="mt-1 text-sm font-medium">
                    {t("dashboard.noTickets")}
                  </p>
                  <p className="max-w-xs text-xs leading-5 text-muted-foreground">
                    {t("dashboard.noTicketsHint")}
                  </p>
                  <Button asChild size="sm" className="mt-3 gap-1.5">
                    <Link to="/new">
                      <Plus className="size-3.5" />
                      {t("common.newTicket")}
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border/70">
                  {mine.tickets.map((ticket) => (
                    <TicketRow key={ticket._id} ticket={ticket} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm">
            <CardHeader className="gap-0 border-b border-border/70 py-5">
              <CardTitle className="text-base">{t("dashboard.todos")}</CardTitle>
              <CardDescription>
                {todos
                  ? t("dashboard.todoSummary", {
                      open: todos.open,
                      done: todos.done,
                    })
                  : t("dashboard.openTodosHint")}
              </CardDescription>
            </CardHeader>

            <form
              onSubmit={handleAddTodo}
              className="flex items-center gap-2 border-b border-border/70 px-5 py-3"
            >
              <Input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={t("dashboard.todoAdd")}
                className="h-9 bg-background"
              />
              <Button
                type="submit"
                size="icon"
                className="size-9 shrink-0"
                disabled={draft.trim().length < 2}
                aria-label={t("dashboard.todoAdd")}
              >
                <Plus className="size-4" />
              </Button>
            </form>

            <CardContent className="px-0 py-0">
              {todos === undefined ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : todos.items.length === 0 ? (
                <p className="px-6 py-10 text-center text-xs leading-5 text-muted-foreground">
                  {t("dashboard.todoEmpty")}
                </p>
              ) : (
                <ul className="max-h-[22rem] divide-y divide-border/70 overflow-y-auto">
                  {todos.items.map((todo) => (
                    <li
                      key={todo._id}
                      className="group flex items-start gap-3 px-5 py-3"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggle(todo._id, !todo.done)}
                        aria-label={
                          todo.done
                            ? t("dashboard.markNotDone")
                            : t("dashboard.markDone")
                        }
                        className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-primary"
                      >
                        {todo.done ? (
                          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Circle className="size-4" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-[13px] leading-5",
                            todo.done && "text-muted-foreground line-through",
                          )}
                        >
                          {todo.title}
                        </p>
                        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/80">
                          {t("dashboard.todoAdded", {
                            time: timeAgo(todo.createdAt),
                          })}
                          {todo.ticketId ? t("dashboard.todoLinked") : ""}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={t("dashboard.deleteTodo")}
                        onClick={() => handleDelete(todo._id)}
                        className="size-7 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="size-4 text-muted-foreground" />
                {t("dashboard.teamCard")}
              </CardTitle>
              <CardDescription>{t("dashboard.teamHint")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {teamTiles.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 font-mono text-2xl font-medium tabular-nums">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.hint}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild variant="outline" className="bg-card">
                  <Link to="/catalog">{t("common.browseCatalog")}</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="text-muted-foreground"
                >
                  <Link to="/admin">{t("nav.admin")}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
