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
import { errorMessage } from "@/lib/errors";
import { timeAgo } from "@/lib/tickets";
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
      toast.error(errorMessage(caught, "Could not add that todo."));
    }
  };

  const handleToggle = async (todoId: Id<"todos">, done: boolean) => {
    try {
      await toggleTodo({ todoId, done });
    } catch (caught) {
      toast.error(errorMessage(caught, "Could not update that todo."));
    }
  };

  const handleDelete = async (todoId: Id<"todos">) => {
    try {
      await deleteTodo({ todoId });
    } catch (caught) {
      toast.error(errorMessage(caught, "Could not delete that todo."));
    }
  };

  return (
    <AppShell
      title="Dashboard"
      description="Your tickets, your todos, and what is waiting on you."
      actions={
        <Button asChild className="gap-2">
          <Link to="/new">
            <Plus className="size-4" />
            New ticket
          </Link>
        </Button>
      }
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Assigned to me"
            value={mine?.assignedCount ?? 0}
            hint="Unresolved tickets with your name on them"
            icon={UserRound}
          />
          <StatTile
            label="My open"
            value={mine?.open ?? 0}
            hint="Tickets you logged that need work"
            icon={Inbox}
          />
          <StatTile
            label="Waiting"
            value={mine?.waiting ?? 0}
            hint="Answered, waiting on someone else"
            icon={Clock3}
          />
          <StatTile
            label="Open todos"
            value={todos?.open ?? 0}
            hint="On your personal list"
            icon={ListTodo}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm">
            <CardHeader className="gap-0 border-b border-border/70 py-5">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="size-4 text-muted-foreground" />
                Assigned to you
              </CardTitle>
              <CardDescription>
                {mine && mine.assignedCount > 0
                  ? `${mine.assignedCount} unresolved ticket${
                      mine.assignedCount === 1 ? "" : "s"
                    } in your name`
                  : "Nothing is waiting on you right now"}
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
                  <p className="mt-1 text-sm font-medium">Inbox zero</p>
                  <p className="max-w-xs text-xs leading-5 text-muted-foreground">
                    Tickets appear here once you claim one. Pick up anything
                    unowned from the catalog.
                  </p>
                  <Button asChild size="sm" variant="outline" className="mt-3 bg-card">
                    <Link to="/catalog">Find something to pick up</Link>
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
              <CardTitle className="text-base">My tickets</CardTitle>
              <CardDescription>
                {mine && mine.total > 0
                  ? `${mine.total} you logged · ${mine.done} closed out`
                  : "Nothing logged under your name yet"}
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
                  <p className="mt-1 text-sm font-medium">No tickets yet</p>
                  <p className="max-w-xs text-xs leading-5 text-muted-foreground">
                    Log something you are waiting on and it shows up here
                    alongside the rest of the catalog.
                  </p>
                  <Button asChild size="sm" className="mt-3 gap-1.5">
                    <Link to="/new">
                      <Plus className="size-3.5" />
                      New ticket
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
              <CardTitle className="text-base">Todos</CardTitle>
              <CardDescription>
                {todos
                  ? `${todos.open} open · ${todos.done} done`
                  : "Your personal list"}
              </CardDescription>
            </CardHeader>

            <form
              onSubmit={handleAddTodo}
              className="flex items-center gap-2 border-b border-border/70 px-5 py-3"
            >
              <Input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Add a todo"
                className="h-9 bg-background"
              />
              <Button
                type="submit"
                size="icon"
                className="size-9 shrink-0"
                disabled={draft.trim().length < 2}
                aria-label="Add todo"
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
                  Empty list. Todos are private to you — use them for follow-ups
                  that do not deserve their own ticket.
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
                          todo.done ? "Mark as not done" : "Mark as done"
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
                          added {timeAgo(todo.createdAt)}
                          {todo.ticketId ? " · linked to ticket" : ""}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Delete todo"
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
                Across the team
              </CardTitle>
              <CardDescription>
                The whole queue, not just your slice of it
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    label: "Open",
                    value: stats?.open ?? 0,
                    hint: "Nobody has replied yet",
                  },
                  {
                    label: "Waiting",
                    value: stats?.pending ?? 0,
                    hint: "Waiting on someone",
                  },
                  {
                    label: "Urgent",
                    value: stats?.needingAttention ?? 0,
                    hint: "High or urgent, open",
                  },
                  {
                    label: "Unassigned",
                    value: stats?.unassigned ?? 0,
                    hint: "Nobody owns these yet",
                  },
                ].map((item) => (
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
                  <Link to="/catalog">Browse the catalog</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="text-muted-foreground"
                >
                  <Link to="/admin">Open the admin area</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
