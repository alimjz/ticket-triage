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
import {
  PRIORITY_META,
  PRIORITY_ORDER,
  STATUS_META,
  STATUS_ORDER,
  formatDateTime,
  formatMinutes,
  timeAgo,
} from "@/lib/tickets";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MessageSquare,
  RotateCcw,
  Send,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
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
  const data = useQuery(
    api.tickets.getTicket,
    ticketId ? { ticketId: ticketId as Id<"tickets"> } : "skip",
  );
  const replyToTicket = useMutation(api.tickets.replyToTicket);
  const updateTicket = useMutation(api.tickets.updateTicket);

  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);

  const ticket = data?.ticket ?? null;
  const messages = data?.messages ?? [];

  const handleReply = async () => {
    if (!ticket || reply.trim().length < 2) return;
    setIsSending(true);
    try {
      await replyToTicket({ ticketId: ticket._id, body: reply });
      setReply("");
      toast.success("Reply sent — ticket moved to Waiting");
    } catch {
      toast.error("Could not send that reply");
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (status: TicketStatus) => {
    if (!ticket) return;
    try {
      await updateTicket({ ticketId: ticket._id, status });
      toast.success(
        status === "resolved"
          ? "Ticket marked resolved"
          : `Status set to ${STATUS_META[status].label}`,
      );
    } catch {
      toast.error("Could not update the status");
    }
  };

  const handlePriorityChange = async (priority: TicketPriority) => {
    if (!ticket) return;
    try {
      await updateTicket({ ticketId: ticket._id, priority });
      toast.success(`Priority set to ${PRIORITY_META[priority].label}`);
    } catch {
      toast.error("Could not update the priority");
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
              This ticket no longer exists or the link is incorrect.
            </p>
            <Button asChild variant="outline" className="bg-card">
              <Link to="/dashboard/tickets">
                <ArrowLeft className="size-4" />
                Back to queue
              </Link>
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const statusMeta = STATUS_META[ticket.status];
  const priorityMeta = PRIORITY_META[ticket.priority];
  const firstReply = ticket.firstAgentReplyAt
    ? formatMinutes(Math.round((ticket.firstAgentReplyAt - ticket.createdAt) / 60000))
    : null;

  return (
    <AppShell
      title={ticket.subject}
      description={`${ticket.reference} · from ${ticket.customerName} · ${timeAgo(
        ticket.createdAt,
      )}`}
      actions={
        <>
          <Badge className={priorityMeta.badge}>{priorityMeta.label}</Badge>
          <Badge className={statusMeta.badge}>{statusMeta.label}</Badge>
          <Button asChild variant="outline" className="gap-2 bg-card">
            <Link to="/dashboard/tickets">
              <ArrowLeft className="size-4" />
              Back to queue
            </Link>
          </Button>
        </>
      }
    >
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm">
          <CardHeader className="gap-0 border-b border-border/70 py-5">
            <CardTitle className="text-base">Conversation</CardTitle>
            <CardDescription>
              {messages.length} message{messages.length === 1 ? "" : "s"} · opened{" "}
              {formatDateTime(ticket.createdAt)}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 py-6">
            {messages.map((message) => {
              const isAgent = message.authorType === "agent";
              return (
                <div
                  key={message._id}
                  className={cn(
                    "flex gap-3",
                    isAgent ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                      isAgent
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {initials(message.authorName) || (isAgent ? "A" : "C")}
                  </span>

                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm",
                      isAgent
                        ? "rounded-tr-sm bg-primary/[0.07] ring-1 ring-primary/15"
                        : "rounded-tl-sm border border-border/70 bg-muted/40",
                    )}
                  >
                    <div
                      className={cn(
                        "mb-1.5 flex flex-wrap items-center gap-2 text-[11px]",
                        isAgent ? "justify-end" : "justify-start",
                      )}
                    >
                      <span className="font-semibold text-foreground">
                        {isAgent ? "You" : message.authorName}
                      </span>
                      <span className="text-muted-foreground">
                        {timeAgo(message.createdAt)}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-foreground/90">
                      {message.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>

          <div className="border-t border-border/70 bg-muted/20 px-6 py-5">
            <div className="flex items-center gap-2 text-[13px] font-medium">
              <MessageSquare className="size-4 text-primary" />
              Reply to {ticket.customerName}
            </div>
            <Textarea
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  event.preventDefault();
                  void handleReply();
                }
              }}
              placeholder={`Hi ${ticket.customerName.split(" ")[0]}, thanks for reaching out —`}
              className="mt-3 min-h-28 bg-card"
              disabled={isSending}
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Sending a reply moves this ticket to{" "}
                <span className="font-medium text-foreground">Waiting</span>. Press
                ⌘/Ctrl + Enter to send.
              </p>
              <Button
                onClick={handleReply}
                disabled={isSending || reply.trim().length < 2}
                className="gap-2 shadow-sm"
              >
                {isSending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Send reply
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Triage</CardTitle>
              <CardDescription>Status and priority drive the queue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Status</p>
                <Select
                  value={ticket.status}
                  onValueChange={(value) =>
                    handleStatusChange(value as TicketStatus)
                  }
                >
                  <SelectTrigger className="w-full bg-card">
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
                  {statusMeta.hint}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Priority
                </p>
                <Select
                  value={ticket.priority}
                  onValueChange={(value) =>
                    handlePriorityChange(value as TicketPriority)
                  }
                >
                  <SelectTrigger className="w-full bg-card">
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
                  {priorityMeta.hint}
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
                    <CheckCircle2 className="size-4 text-emerald-600" />
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
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Customer</CardTitle>
              <CardDescription>Who asked, and when</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-[13px]">
              <div>
                <p className="font-medium">{ticket.customerName}</p>
                <a
                  href={`mailto:${ticket.customerEmail}`}
                  className="mt-1 flex items-center gap-1.5 text-primary hover:underline"
                >
                  <Mail className="size-3.5" />
                  {ticket.customerEmail}
                </a>
              </div>
              <Separator />
              <dl className="space-y-2.5 text-muted-foreground">
                <div className="flex items-center justify-between gap-3">
                  <dt>Opened</dt>
                  <dd className="text-foreground">
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
                  <dt>First reply</dt>
                  <dd className="flex items-center gap-1.5 text-foreground">
                    <Clock className="size-3.5" />
                    {firstReply ?? "Not replied yet"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt>Messages</dt>
                  <dd className="text-foreground">{messages.length}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
