import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  ticketPriorityValidator,
  ticketStatusValidator,
  type TicketPriority,
  type TicketStatus,
} from "./schema";

const DAY_MS = 24 * 60 * 60 * 1000;
const REFERENCE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

const attachmentInput = v.object({
  storageId: v.id("_storage"),
  name: v.string(),
  size: v.number(),
  contentType: v.optional(v.string()),
});

/** Every screen in Intake sits behind an account. */
async function requireUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new ConvexError("Sign in to use Intake.");
  }
  return userId;
}

function randomReference() {
  let code = "";
  for (let i = 0; i < 5; i += 1) {
    code +=
      REFERENCE_ALPHABET[Math.floor(Math.random() * REFERENCE_ALPHABET.length)];
  }
  return `INT-${code}`;
}

function preview(body: string) {
  const single = body.replace(/\s+/g, " ").trim();
  return single.length > 160 ? `${single.slice(0, 157)}...` : single;
}

function utcDayKey(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function displayName(user: Doc<"users"> | null, fallback = "Teammate") {
  const name = user?.name?.trim();
  if (name) return name;
  const email = user?.email?.trim();
  if (email) return email.split("@")[0];
  return fallback;
}

/** A ticket plus the resolved name of the teammate who owns it. */
export type TicketWithOwner = Doc<"tickets"> & { assigneeName?: string };

/** Names for every account in the workspace, keyed by user id. */
async function ownerNames(ctx: QueryCtx) {
  const users = await ctx.db.query("users").take(200);
  const names = new Map<Id<"users">, string>();
  for (const user of users) {
    names.set(user._id, displayName(user));
  }
  return names;
}

function attachOwner(
  ticket: Doc<"tickets">,
  names: Map<Id<"users">, string>,
): TicketWithOwner {
  return {
    ...ticket,
    assigneeName: ticket.assigneeId ? names.get(ticket.assigneeId) : undefined,
  };
}

/** The teammates a ticket can be assigned to. */
export const teamMembers = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);

    const users = await ctx.db.query("users").take(200);

    return users
      .map((user) => ({
        _id: user._id,
        name: displayName(user),
        email: user.email ?? "",
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});

/** Signed-in users upload files straight to Convex storage. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/** Log a new ticket, optionally with files attached. */
export const createTicket = mutation({
  args: {
    subject: v.string(),
    body: v.string(),
    attachments: v.optional(v.array(attachmentInput)),
    assigneeId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const author = await ctx.db.get(userId);

    const subject = args.subject.trim();
    const body = args.body.trim();
    const files = (args.attachments ?? []).slice(0, MAX_ATTACHMENTS);

    if (subject.length < 4) {
      throw new ConvexError("Give the ticket a title of at least 4 characters.");
    }
    if (body.length < 10) {
      throw new ConvexError("Describe the request in at least 10 characters.");
    }
    for (const file of files) {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        throw new ConvexError(`${file.name} is larger than 10 MB.`);
      }
    }
    if (args.assigneeId) {
      const assignee = await ctx.db.get(args.assigneeId);
      if (assignee === null) {
        throw new ConvexError("That teammate no longer exists.");
      }
    }

    let reference = randomReference();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const clash = await ctx.db
        .query("tickets")
        .withIndex("by_reference", (q) => q.eq("reference", reference))
        .unique();
      if (clash === null) break;
      reference = randomReference();
    }

    const now = Date.now();
    const ticketId = await ctx.db.insert("tickets", {
      reference,
      subject,
      requesterId: userId,
      customerName: displayName(author),
      customerEmail: author?.email ?? "",
      assigneeId: args.assigneeId,
      status: TICKET_STATUSES.OPEN,
      priority: TICKET_PRIORITIES.NORMAL,
      messageCount: 1,
      lastMessagePreview: preview(body),
      lastActivityAt: now,
      createdAt: now,
    });

    await ctx.db.insert("ticketMessages", {
      ticketId,
      authorId: userId,
      authorName: displayName(author),
      body,
      createdAt: now,
    });

    for (const file of files) {
      await ctx.db.insert("attachments", {
        ticketId,
        uploadedBy: userId,
        storageId: file.storageId,
        name: file.name,
        size: file.size,
        contentType: file.contentType,
        createdAt: now,
      });
    }

    return { reference, ticketId };
  },
});

/** The catalog: every ticket, most recent activity first. */
export const listTickets = query({
  args: {
    status: v.optional(v.union(v.literal("all"), ticketStatusValidator)),
    priority: v.optional(v.union(v.literal("all"), ticketPriorityValidator)),
    search: v.optional(v.string()),
    assignee: v.optional(
      v.union(v.literal("any"), v.literal("me"), v.literal("unassigned")),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);

    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_last_activity")
      .order("desc")
      .take(200);

    const names = await ownerNames(ctx);

    const search = args.search?.trim().toLowerCase() ?? "";
    const status = args.status ?? "all";
    const priority = args.priority ?? "all";
    const assignee = args.assignee ?? "any";

    return tickets
      .filter((ticket) => {
        if (status !== "all" && ticket.status !== status) return false;
        if (priority !== "all" && ticket.priority !== priority) return false;
        if (assignee === "me" && ticket.assigneeId !== userId) return false;
        if (assignee === "unassigned" && ticket.assigneeId !== undefined) {
          return false;
        }
        if (!search) return true;
        return (
          ticket.subject.toLowerCase().includes(search) ||
          ticket.reference.toLowerCase().includes(search) ||
          ticket.customerName.toLowerCase().includes(search) ||
          ticket.customerEmail.toLowerCase().includes(search) ||
          ticket.lastMessagePreview.toLowerCase().includes(search) ||
          (ticket.assigneeId
            ? (names.get(ticket.assigneeId) ?? "").toLowerCase().includes(search)
            : false)
        );
      })
      .map((ticket) => attachOwner(ticket, names));
  },
});

/** One ticket with its thread and attached files. */
export const getTicket = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    await requireUser(ctx);

    const ticket = await ctx.db.get(args.ticketId);
    if (ticket === null) return null;

    const messages = await ctx.db
      .query("ticketMessages")
      .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
      .order("asc")
      .collect();

    const attachmentRows = await ctx.db
      .query("attachments")
      .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
      .collect();

    const attachments = await Promise.all(
      attachmentRows.map(async (file) => ({
        _id: file._id,
        name: file.name,
        size: file.size,
        contentType: file.contentType,
        url: await ctx.storage.getUrl(file.storageId),
      })),
    );

    return { ticket, messages, attachments };
  },
});

/** Add a comment. The thread decides who the ticket is waiting on. */
export const addComment = mutation({
  args: { ticketId: v.id("tickets"), body: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const body = args.body.trim();
    if (body.length < 2) {
      throw new ConvexError("Write something before posting.");
    }

    const ticket = await ctx.db.get(args.ticketId);
    if (ticket === null) {
      throw new ConvexError("That ticket no longer exists.");
    }

    const author = await ctx.db.get(userId);
    const now = Date.now();
    const isRequester =
      ticket.requesterId !== undefined && ticket.requesterId === userId;

    await ctx.db.insert("ticketMessages", {
      ticketId: args.ticketId,
      authorId: userId,
      authorName: displayName(author),
      body,
      createdAt: now,
    });

    await ctx.db.patch(args.ticketId, {
      messageCount: ticket.messageCount + 1,
      lastMessagePreview: preview(body),
      lastActivityAt: now,
      // the first reply from someone other than the requester starts the clock
      firstResponseAt: isRequester
        ? ticket.firstResponseAt
        : (ticket.firstResponseAt ?? now),
      // a requester comment reopens the ticket, a teammate comment waits on them
      status: isRequester
        ? TICKET_STATUSES.OPEN
        : TICKET_STATUSES.PENDING,
      resolvedAt: undefined,
    });
  },
});

/** Move a ticket through the queue. */
export const updateTicket = mutation({
  args: {
    ticketId: v.id("tickets"),
    status: v.optional(ticketStatusValidator),
    priority: v.optional(ticketPriorityValidator),
    // null clears the owner, undefined leaves it alone
    assigneeId: v.optional(v.union(v.id("users"), v.null())),
  },
  handler: async (ctx, args) => {
    await requireUser(ctx);

    const ticket = await ctx.db.get(args.ticketId);
    if (ticket === null) {
      throw new ConvexError("That ticket no longer exists.");
    }

    const patch: Partial<Doc<"tickets">> = {};
    if (args.status !== undefined) {
      patch.status = args.status;
      patch.resolvedAt =
        args.status === TICKET_STATUSES.RESOLVED ? Date.now() : undefined;
    }
    if (args.priority !== undefined) {
      patch.priority = args.priority;
    }
    if (args.assigneeId !== undefined) {
      if (args.assigneeId === null) {
        patch.assigneeId = undefined;
      } else {
        const assignee = await ctx.db.get(args.assigneeId);
        if (assignee === null) {
          throw new ConvexError("That teammate no longer exists.");
        }
        patch.assigneeId = args.assigneeId;
      }
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(args.ticketId, patch);
    }
  },
});

/** Remove a ticket, its thread, and its files. */
export const deleteTicket = mutation({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    await requireUser(ctx);

    const ticket = await ctx.db.get(args.ticketId);
    if (ticket === null) return;

    const messages = await ctx.db
      .query("ticketMessages")
      .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
      .collect();
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    const files = await ctx.db
      .query("attachments")
      .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
      .collect();
    for (const file of files) {
      await ctx.storage.delete(file.storageId);
      await ctx.db.delete(file._id);
    }

    const linkedTodos = await ctx.db.query("todos").collect();
    for (const todo of linkedTodos) {
      if (todo.ticketId === args.ticketId) {
        await ctx.db.patch(todo._id, { ticketId: undefined });
      }
    }

    await ctx.db.delete(args.ticketId);
  },
});

export type TeamStats = {
  total: number;
  open: number;
  pending: number;
  resolved: number;
  closed: number;
  needingAttention: number;
  unassigned: number;
  resolvedThisWeek: number;
  avgFirstResponseMinutes: number | null;
  oldestOpenAt: number | null;
  activity: { day: string; tickets: number }[];
  recent: TicketWithOwner[];
  queue: TicketWithOwner[];
};

/** Team-wide numbers for the admin area. */
export const stats = query({
  args: {},
  handler: async (ctx): Promise<TeamStats> => {
    await requireUser(ctx);

    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_last_activity")
      .order("desc")
      .take(500);

    const now = Date.now();
    const weekAgo = now - 7 * DAY_MS;

    const counts: Record<TicketStatus, number> = {
      open: 0,
      pending: 0,
      resolved: 0,
      closed: 0,
    };
    let needingAttention = 0;
    let unassigned = 0;
    let resolvedThisWeek = 0;
    let oldestOpenAt: number | null = null;
    let responseTotal = 0;
    let responseCount = 0;

    const activityByDay = new Map<string, number>();
    for (let offset = 13; offset >= 0; offset -= 1) {
      activityByDay.set(utcDayKey(now - offset * DAY_MS), 0);
    }

    for (const ticket of tickets) {
      counts[ticket.status] += 1;
      const isUnresolved =
        ticket.status === TICKET_STATUSES.OPEN ||
        ticket.status === TICKET_STATUSES.PENDING;
      if (
        isUnresolved &&
        (ticket.priority === TICKET_PRIORITIES.URGENT ||
          ticket.priority === TICKET_PRIORITIES.HIGH)
      ) {
        needingAttention += 1;
      }
      if (isUnresolved && ticket.assigneeId === undefined) {
        unassigned += 1;
      }
      if (
        ticket.status === TICKET_STATUSES.RESOLVED &&
        ticket.resolvedAt &&
        ticket.resolvedAt >= weekAgo
      ) {
        resolvedThisWeek += 1;
      }
      if (ticket.status === TICKET_STATUSES.OPEN) {
        if (oldestOpenAt === null || ticket.createdAt < oldestOpenAt) {
          oldestOpenAt = ticket.createdAt;
        }
      }
      if (ticket.firstResponseAt) {
        responseTotal += ticket.firstResponseAt - ticket.createdAt;
        responseCount += 1;
      }
      const day = utcDayKey(ticket.createdAt);
      if (activityByDay.has(day)) {
        activityByDay.set(day, (activityByDay.get(day) ?? 0) + 1);
      }
    }

    const names = await ownerNames(ctx);

    return {
      total: tickets.length,
      open: counts.open,
      pending: counts.pending,
      resolved: counts.resolved,
      closed: counts.closed,
      needingAttention,
      unassigned,
      resolvedThisWeek,
      avgFirstResponseMinutes:
        responseCount === 0
          ? null
          : Math.round(responseTotal / responseCount / 60000),
      oldestOpenAt,
      activity: Array.from(activityByDay, ([day, count]) => ({
        day,
        tickets: count,
      })),
      recent: tickets.slice(0, 5).map((ticket) => attachOwner(ticket, names)),
      queue: tickets
        .filter(
          (ticket) =>
            ticket.status === TICKET_STATUSES.OPEN ||
            ticket.status === TICKET_STATUSES.PENDING,
        )
        .slice(0, 5)
        .map((ticket) => attachOwner(ticket, names)),
    };
  },
});

export type MyDashboard = {
  open: number;
  total: number;
  waiting: number;
  done: number;
  tickets: TicketWithOwner[];
  assigned: TicketWithOwner[];
  assignedCount: number;
};

/** The signed-in teammate's own tickets, their assignments, and counts. */
export const myDashboard = query({
  args: {},
  handler: async (ctx): Promise<MyDashboard> => {
    const userId = await requireUser(ctx);

    const mine = await ctx.db
      .query("tickets")
      .withIndex("by_requester", (q) => q.eq("requesterId", userId))
      .collect();

    const assignedToMe = await ctx.db
      .query("tickets")
      .withIndex("by_assignee", (q) => q.eq("assigneeId", userId))
      .collect();

    const names = await ownerNames(ctx);

    const isUnresolved = (ticket: Doc<"tickets">) =>
      ticket.status === TICKET_STATUSES.OPEN ||
      ticket.status === TICKET_STATUSES.PENDING;

    const sorted = mine.sort((a, b) => b.lastActivityAt - a.lastActivityAt);
    const assigned = assignedToMe
      .filter(isUnresolved)
      .sort((a, b) => b.lastActivityAt - a.lastActivityAt);

    return {
      open: sorted.filter((ticket) => ticket.status === TICKET_STATUSES.OPEN)
        .length,
      waiting: sorted.filter(
        (ticket) => ticket.status === TICKET_STATUSES.PENDING,
      ).length,
      done: sorted.filter(
        (ticket) =>
          ticket.status === TICKET_STATUSES.RESOLVED ||
          ticket.status === TICKET_STATUSES.CLOSED,
      ).length,
      total: sorted.length,
      tickets: sorted.slice(0, 6).map((ticket) => attachOwner(ticket, names)),
      assigned: assigned.slice(0, 6).map((ticket) => attachOwner(ticket, names)),
      assignedCount: assigned.length,
    };
  },
});

/** Fill an empty workspace with a believable queue. */
export const seedSampleTickets = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);

    const existing = await ctx.db.query("tickets").take(1);
    if (existing.length > 0) return { inserted: 0 };

    const now = Date.now();
    const hourMs = 60 * 60 * 1000;

    type Sample = {
      subject: string;
      requester: string;
      email: string;
      body: string;
      status: TicketStatus;
      priority: TicketPriority;
      hoursAgo: number;
      comment?: { author: string; body: string; delayHours: number };
      ownedByViewer?: boolean;
    };

    const samples: Sample[] = [
      {
        subject: "Rotate the staging API keys before Friday",
        requester: "Maya Okafor",
        email: "maya@example.com",
        body: "Our staging keys are in three places and one of them is in a shared note from last year. I want them rotated and stored in the vault before the release freeze.",
        status: TICKET_STATUSES.OPEN,
        priority: TICKET_PRIORITIES.HIGH,
        hoursAgo: 3,
        ownedByViewer: true,
      },
      {
        subject: "Deploy runbook is out of date",
        requester: "Devon Reyes",
        email: "devon@example.com",
        body: "Following the runbook got me to a step that no longer exists. I wasted twenty minutes on it during the incident yesterday.",
        status: TICKET_STATUSES.OPEN,
        priority: TICKET_PRIORITIES.URGENT,
        hoursAgo: 6,
        ownedByViewer: true,
      },
      {
        subject: "Import fails on files larger than 5 MB",
        requester: "Nina Halvorsen",
        email: "nina@example.com",
        body: "The contact import stops silently at 5 MB. There is no message in the interface and it uploads fine at 4.8 MB, so the limit is real but undocumented.",
        status: TICKET_STATUSES.PENDING,
        priority: TICKET_PRIORITIES.NORMAL,
        hoursAgo: 30,
        comment: {
          author: "Devon Reyes",
          body: "Confirmed on my machine too. The uploader rejects anything over 5 MB with a generic error. I raised the limit to 20 MB on the branch I pushed yesterday.",
          delayHours: 1.5,
        },
      },
      {
        subject: "Charts render blank in Safari",
        requester: "Tobias Lind",
        email: "tobias@example.com",
        body: "Every chart on the analytics page is an empty box in Safari 17, but they render correctly in Chrome and Firefox.",
        status: TICKET_STATUSES.RESOLVED,
        priority: TICKET_PRIORITIES.NORMAL,
        hoursAgo: 96,
        comment: {
          author: "Maya Okafor",
          body: "This was a charting library quirk with Safari. Fixed and deployed — hard refresh and the charts come back.",
          delayHours: 3,
        },
      },
      {
        subject: "Add the onboarding checklist to the handbook",
        requester: "Priya Raman",
        email: "priya@example.com",
        body: "New teammates keep asking the same five questions in their first week. I drafted a checklist and I need someone to review it before it goes in.",
        status: TICKET_STATUSES.PENDING,
        priority: TICKET_PRIORITIES.LOW,
        hoursAgo: 76,
        comment: {
          author: "Nina Halvorsen",
          body: "Added two steps about staging access and the vault. Review it when you have a minute and I will publish it.",
          delayHours: 5,
        },
      },
      {
        subject: "Flaky billing test blocks merges",
        requester: "Marcus Webb",
        email: "marcus@example.com",
        body: "The billing end-to-end test fails about one run in five, so everyone reruns the pipeline until it goes green. It has been like this for two weeks.",
        status: TICKET_STATUSES.OPEN,
        priority: TICKET_PRIORITIES.HIGH,
        hoursAgo: 52,
        ownedByViewer: true,
      },
      {
        subject: "Nightly sync hits the API rate limit",
        requester: "Ana Ferreira",
        email: "ana@example.com",
        body: "The nightly sync gets a 429 partway through and resumes from the beginning the next day. It has not finished a full pass in a week.",
        status: TICKET_STATUSES.OPEN,
        priority: TICKET_PRIORITIES.URGENT,
        hoursAgo: 150,
      },
      {
        subject: "Retries resend stale webhook payloads",
        requester: "Kenji Watanabe",
        email: "kenji@example.com",
        body: "When a delivery fails, the retry carries the payload from the first attempt instead of the latest state, so our consumer applies an outdated event.",
        status: TICKET_STATUSES.OPEN,
        priority: TICKET_PRIORITIES.HIGH,
        hoursAgo: 240,
      },
      {
        subject: "Move the nightly backup to a separate bucket",
        requester: "Helena Vasquez",
        email: "helena@example.com",
        body: "Backups currently land in the same bucket as user uploads. I would rather have them isolated with their own retention rule.",
        status: TICKET_STATUSES.CLOSED,
        priority: TICKET_PRIORITIES.LOW,
        hoursAgo: 300,
        comment: {
          author: "Devon Reyes",
          body: "Split them into the backup bucket with a 90-day lifecycle rule. Closing this, reopen it if anything looks off after the next run.",
          delayHours: 8,
        },
      },
      {
        subject: "Write up the incident postmortem",
        requester: "Grace Adeyemi",
        email: "grace@example.com",
        body: "We agreed to write a public postmortem for the outage on Thursday. Draft due before the next planning meeting.",
        status: TICKET_STATUSES.RESOLVED,
        priority: TICKET_PRIORITIES.NORMAL,
        hoursAgo: 120,
        comment: {
          author: "Devon Reyes",
          body: "Draft is on the internal wiki with the timeline and the three follow-up tickets linked at the bottom. Ready for your review.",
          delayHours: 2,
        },
      },
    ];

    let inserted = 0;
    for (const sample of samples) {
      const createdAt = now - sample.hoursAgo * hourMs;
      const commentAt = sample.comment
        ? createdAt + sample.comment.delayHours * hourMs
        : null;

      const ticketId = await ctx.db.insert("tickets", {
        reference: randomReference(),
        subject: sample.subject,
        customerName: sample.requester,
        customerEmail: sample.email,
        assigneeId: sample.ownedByViewer ? userId : undefined,
        status: sample.status,
        priority: sample.priority,
        messageCount: sample.comment ? 2 : 1,
        lastMessagePreview: preview(sample.comment?.body ?? sample.body),
        lastActivityAt: commentAt ?? createdAt,
        firstResponseAt: commentAt ?? undefined,
        resolvedAt:
          sample.status === TICKET_STATUSES.RESOLVED ? commentAt ?? createdAt : undefined,
        createdAt,
      });

      await ctx.db.insert("ticketMessages", {
        ticketId,
        authorName: sample.requester,
        body: sample.body,
        createdAt,
      });

      if (sample.comment && commentAt) {
        await ctx.db.insert("ticketMessages", {
          ticketId,
          authorName: sample.comment.author,
          body: sample.comment.body,
          createdAt: commentAt,
        });
      }

      inserted += 1;
    }

    return { inserted };
  },
});
