import { AppShell } from "@/components/AppShell";
import { AssigneeSelect, useTeamMembers } from "@/components/AssigneeSelect";
import { PriorityBadge, StatusBadge } from "@/components/TicketRow";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TicketPriority, TicketStatus } from "@/convex/schema";
import { useAuth } from "@/hooks/use-auth";
import { errorMessage } from "@/lib/errors";
import {
  PRIORITY_META,
  PRIORITY_ORDER,
  STATUS_META,
  STATUS_ORDER,
  formatBytes,
  formatDateTime,
  formatMinutes,
  timeAgo,
} from "@/lib/tickets";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  ListPlus,
  Loader2,
  Mail,
  MessageSquare,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function TicketDetail() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { user } = useAuth();
  const data = useQuery(
    api.tickets.getTicket,
    ticketId ? { ticketId: ticketId as Id<"tickets"> } : "skip",
  );
  const addComment = useMutation(api.tickets.addComment);
  const updateTicket = useMutation(api.tickets.updateTicket);
  const createTodo = useMutation(api.todos.createTodo);
  const members = useTeamMembers();
  const navigate = useNavigate();

  const [comment, setComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const ticket = data?.ticket ?? null;
  const messages = data?.messages ?? [];
  const attachments = data?.attachments ?? [];
  const [request, ...discussion] = messages;

  const handleComment = async () => {
    if (!ticket || comment.trim().length < 2) return;
    setIsPosting(true);
    try {
      await addComment({ ticketId: ticket._id, body: comment });
      setComment("");
      toast.success("Comment posted");
    } catch (caught) {
      toast.error(errorMessage(caught, "Could not post that comment."));
    } finally {
      setIsPosting(false);
    }
  };

  const handleStatusChange = async (status: TicketStatus) => {
    if (!ticket) return;
    try {
      await updateTicket({ ticketId: ticket._id, status });
      toast.success(`Status set to ${STATUS_META[status].label.toLowerCase()}`);
    } catch (caught) {
      toast.error(errorMessage(caught, "Could not update the status."));
    }
  };

  const handlePriorityChange = async (priority: TicketPriority) => {
    if (!ticket) return;
    try {
      await updateTicket({ ticketId: ticket._id, priority });
      toast.success(
        `Priority set to ${PRIORITY_META[priority].label.toLowerCase()}`,
      );
    } catch (caught) {
      toast.error(errorMessage(caught, "Could not update the priority."));
    }
  };

  const handleAssigneeChange = async (assigneeId: Id<"users"> | null) => {
    if (!ticket) return;
    try {
      await updateTicket({ ticketId: ticket._id, assigneeId });
      toast.success(assigneeId ? "Owner updated" : "Owner cleared");
    } catch (caught) {
      toast.error(errorMessage(caught, "Could not change the owner."));
    }
  };

  const handleAddTodo = async () => {
    if (!ticket) return;
    try {
      await createTodo({
        title: `Follow up: ${ticket.subject}`,
        ticketId: ticket._id,
      });
      toast.success("Added to your todos", {
        action: {
          label: "Open dashboard",
          onClick: () => navigate("/dashboard"),
        },
      });
    } catch (caught) {
      toast.error(errorMessage(caught, "Could not add that todo."));
    }
  };

  if (data === undefined) {
    return (
      <AppShell title="Ticket">
        <div className="flex h-64 items-center justify-center rounded-2xl border border-border/70 bg-card">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  if (ticket === null) {
    return (
      <AppShell title="Ticket not found">
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardContent className="flex flex-col items-start gap-3 py-8">
            <p className="text-sm text-muted-foreground">
              This ticket no longer exists, or the link is out of date.
            </p>
            <Button asChild variant="outline" className="bg-card">
              <Link to="/catalog">
                <ArrowLeft className="size-4" />
                Back to catalog
              </Link>
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const firstResponse = ticket.firstResponseAt
    ? formatMinutes(
        Math.round((ticket.firstResponseAt - ticket.createdAt) / 60000),
      )
    : null;

  return (
    <AppShell
      title={ticket.subject}
      description={`${ticket.reference} · logged by ${ticket.customerName} ${timeAgo(
        ticket.createdAt,
      )}`}
      actions={
        <>
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
          <Button asChild variant="outline" className="gap-2 bg-card">
            <Link to="/catalog">
              <ArrowLeft className="size-4" />
              Catalog
            </Link>
          </Button>
        </>
      }
    >
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Request</CardTitle>
              <CardDescription>
                <span className="font-mono text-[11px]">{ticket.reference}</span>
                {" · opened "}
                {formatDateTime(ticket.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[11px] text-muted-foreground">
                  {initials(ticket.customerName)}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium">
                    {ticket.customerName}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                    {request?.body ?? ticket.lastMessagePreview}
                  </p>
                </div>
              </div>

              {attachments.length > 0 ? (
                <>
                  <Separator />
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      Attachments
                    </p>
                    <ul className="mt-3 space-y-2">
                      {attachments.map((file) => (
                        <li
                          key={file._id}
                          className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-2"
                        >
                          <FileText className="size-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1 truncate text-[13px]">
                            {file.name}
                          </span>
                          <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                            {formatBytes(file.size)}
                          </span>
                          {file.url ? (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex shrink-0 items-center gap-1.5 text-[12px] text-primary hover:underline"
                            >
                              <Download className="size-3.5" />
                              Download
                            </a>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm">
            <CardHeader className="gap-0 border-b border-border/70 py-5">
              <CardTitle className="text-base">Discussion</CardTitle>
              <CardDescription>
                {discussion.length === 0
                  ? "No comments yet — start the thread"
                  : `${discussion.length} comment${
                      discussion.length === 1 ? "" : "s"
                    }`}
              </CardDescription>
            </CardHeader>

            {discussion.length > 0 ? (
              <CardContent className="divide-y divide-border/70 px-0 py-0">
                {discussion.map((message) => {
                  const isMine = message.authorId === user?._id;
                  return (
                    <div key={message._id} className="flex gap-3 px-6 py-4">
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-[11px]",
                          isMine
                            ? "bg-primary/12 text-primary"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {initials(message.authorName)}
                      </span>
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 text-[13px]">
                          <span className="font-medium">
                            {isMine ? "You" : message.authorName}
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {timeAgo(message.createdAt)}
                          </span>
                        </p>
                        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                          {message.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            ) : null}

            <div className="border-t border-border/70 bg-muted/10 px-6 py-5">
              <div className="flex items-center gap-2 text-[13px] font-medium">
                <MessageSquare className="size-4 text-primary" />
                Add a comment
              </div>
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                    event.preventDefault();
                    void handleComment();
                  }
                }}
                placeholder="Share findings, blockers, or the next step."
                className="mt-3 min-h-24 bg-background"
                disabled={isPosting}
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  A comment from the requester reopens the ticket; anyone else
                  moves it to waiting. ⌘/Ctrl + Enter to post.
                </p>
                <Button
                  onClick={handleComment}
                  disabled={isPosting || comment.trim().length < 2}
                  className="gap-2"
                >
                  {isPosting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <MessageSquare className="size-4" />
                  )}
                  Post comment
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Triage</CardTitle>
              <CardDescription>
                Status and priority decide what the queue shows first
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Status
                </p>
                <Select
                  value={ticket.status}
                  onValueChange={(value) =>
                    handleStatusChange(value as TicketStatus)
                  }
                >
                  <SelectTrigger className="w-full bg-background">
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
                <p className="text-xs text-muted-foreground">
                  {STATUS_META[ticket.status].hint}
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Priority
                </p>
                <Select
                  value={ticket.priority}
                  onValueChange={(value) =>
                    handlePriorityChange(value as TicketPriority)
                  }
                >
                  <SelectTrigger className="w-full bg-background">
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
                <p className="text-xs text-muted-foreground">
                  {PRIORITY_META[ticket.priority].hint}
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Owner
                </p>
                <AssigneeSelect
                  members={members}
                  value={ticket.assigneeId}
                  onChange={handleAssigneeChange}
                  className="w-full bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  {ticket.assigneeId
                    ? "This teammate owns the next move."
                    : "Nobody owns this ticket yet."}
                </p>
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                {ticket.status !== "resolved" ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 bg-card"
                    onClick={() => handleStatusChange("resolved")}
                  >
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                    Mark as resolved
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 bg-card"
                    onClick={() => handleStatusChange("open")}
                  >
                    <RotateCcw className="size-4" />
                    Reopen as open
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 bg-card"
                  onClick={handleAddTodo}
                >
                  <ListPlus className="size-4" />
                  Add to my todos
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
              <CardDescription>
                Who logged it, and what happened since
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-[13px]">
              <div>
                <p className="font-medium">{ticket.customerName}</p>
                {ticket.customerEmail ? (
                  <a
                    href={`mailto:${ticket.customerEmail}`}
                    className="mt-1 flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <Mail className="size-3.5" />
                    {ticket.customerEmail}
                  </a>
                ) : (
                  <p className="mt-1 text-muted-foreground">No email on file</p>
                )}
              </div>
              <Separator />
              <dl className="space-y-2.5 text-muted-foreground">
                <div className="flex items-center justify-between gap-3">
                  <dt>Opened</dt>
                  <dd className="text-right text-foreground">
                    {formatDateTime(ticket.createdAt)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt>Last activity</dt>
                  <dd className="text-foreground">
                    {timeAgo(ticket.lastActivityAt)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt>First response</dt>
                  <dd className="font-mono text-[12px] text-foreground">
                    {firstResponse ?? "pending"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt>Comments</dt>
                  <dd className="font-mono text-[12px] text-foreground">
                    {discussion.length}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt>Files</dt>
                  <dd className="font-mono text-[12px] text-foreground">
                    {attachments.length}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
