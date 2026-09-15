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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REFERENCE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const DAY_MS = 24 * 60 * 60 * 1000;

/** Only the signed-in agent (the ticket owner) can read or change the queue. */
async function requireAgent(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new ConvexError("You need to sign in to manage tickets.");
  }
  return userId;
}

function randomReference() {
  let code = "";
  for (let i = 0; i < 5; i += 1) {
    code += REFERENCE_ALPHABET[Math.floor(Math.random() * REFERENCE_ALPHABET.length)];
  }
  return `TCK-${code}`;
}

function preview(body: string) {
  const single = body.replace(/\s+/g, " ").trim();
  return single.length > 160 ? `${single.slice(0, 157)}...` : single;
}

function utcDayKey(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

/** Public: a customer submits a ticket. No account required. */
export const createTicket = mutation({
  args: {
    customerName: v.string(),
    customerEmail: v.string(),
    subject: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const customerName = args.customerName.trim();
    const customerEmail = args.customerEmail.trim().toLowerCase();
    const subject = args.subject.trim();
    const body = args.body.trim();

    if (customerName.length < 2) {
      throw new ConvexError("Please enter your name.");
    }
    if (!EMAIL_PATTERN.test(customerEmail)) {
      throw new ConvexError("Please enter a valid email address.");
    }
    if (subject.length < 4) {
      throw new ConvexError("Please add a short subject (at least 4 characters).");
    }
    if (body.length < 10) {
      throw new ConvexError("Please describe the issue in at least 10 characters.");
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
      customerName,
      customerEmail,
      status: TICKET_STATUSES.OPEN,
      priority: TICKET_PRIORITIES.NORMAL,
      messageCount: 1,
      lastMessagePreview: preview(body),
      lastActivityAt: now,
      createdAt: now,
    });

    await ctx.db.insert("ticketMessages", {
      ticketId,
      authorType: "customer",
      authorName: customerName,
      body,
      createdAt: now,
    });

    return { reference, ticketId };
  },
});

/** Agent only: the triage queue, newest activity first. */
export const listTickets = query({
  args: {
    status: v.optional(v.union(v.literal("all"), ticketStatusValidator)),
    priority: v.optional(v.union(v.literal("all"), ticketPriorityValidator)),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAgent(ctx);

    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_last_activity")
      .order("desc")
      .take(200);

    const search = args.search?.trim().toLowerCase() ?? "";
    const status = args.status ?? "all";
    const priority = args.priority ?? "all";

    return tickets.filter((ticket) => {
      if (status !== "all" && ticket.status !== status) return false;
      if (priority !== "all" && ticket.priority !== priority) return false;
      if (!search) return true;
      return (
        ticket.subject.toLowerCase().includes(search) ||
        ticket.customerEmail.toLowerCase().includes(search) ||
        ticket.customerName.toLowerCase().includes(search) ||
        ticket.reference.toLowerCase().includes(search)
      );
    });
  },
});

/** Agent only: one ticket plus its full conversation. */
export const getTicket = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    await requireAgent(ctx);

    const ticket = await ctx.db.get(args.ticketId);
    if (ticket === null) return null;

    const messages = await ctx.db
      .query("ticketMessages")
      .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
      .order("asc")
      .collect();

    return { ticket, messages };
  },
});

/** Agent only: reply to the customer. */
export const replyToTicket = mutation({
  args: { ticketId: v.id("tickets"), body: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireAgent(ctx);
    const body = args.body.trim();
    if (body.length < 2) {
      throw new ConvexError("Write a reply before sending.");
    }

    const ticket = await ctx.db.get(args.ticketId);
    if (ticket === null) {
      throw new ConvexError("That ticket no longer exists.");
    }

    const agent = await ctx.db.get(userId);
    const now = Date.now();

    await ctx.db.insert("ticketMessages", {
      ticketId: args.ticketId,
      authorType: "agent",
      authorName: agent?.name?.trim() || "Support agent",
      body,
      createdAt: now,
    });

    await ctx.db.patch(args.ticketId, {
      messageCount: ticket.messageCount + 1,
      lastMessagePreview: preview(body),
      lastActivityAt: now,
      firstAgentReplyAt: ticket.firstAgentReplyAt ?? now,
      // a fresh reply means the thread now waits on the customer
      status: TICKET_STATUSES.PENDING,
      resolvedAt: undefined,
    });
  },
});

/** Agent only: move a ticket through triage. */
export const updateTicket = mutation({
  args: {
    ticketId: v.id("tickets"),
    status: v.optional(ticketStatusValidator),
    priority: v.optional(ticketPriorityValidator),
  },
  handler: async (ctx, args) => {
    await requireAgent(ctx);

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

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(args.ticketId, patch);
    }
  },
});

export type TicketStats = {
  total: number;
  open: number;
  pending: number;
  resolved: number;
  closed: number;
  needingAttention: number;
  resolvedThisWeek: number;
  avgFirstReplyMinutes: number | null;
  oldestOpenAt: number | null;
  activity: { day: string; tickets: number }[];
  recent: Doc<"tickets">[];
  queue: Doc<"tickets">[];
};

/** Agent only: the numbers behind the overview screen. */
export const stats = query({
  args: {},
  handler: async (ctx): Promise<TicketStats> => {
    await requireAgent(ctx);

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
    let resolvedThisWeek = 0;
    let oldestOpenAt: number | null = null;
    let replyTotal = 0;
    let replyCount = 0;

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
      if (ticket.status === TICKET_STATUSES.RESOLVED && ticket.resolvedAt && ticket.resolvedAt >= weekAgo) {
        resolvedThisWeek += 1;
      }
      if (ticket.status === TICKET_STATUSES.OPEN) {
        if (oldestOpenAt === null || ticket.createdAt < oldestOpenAt) {
          oldestOpenAt = ticket.createdAt;
        }
      }
      if (ticket.firstAgentReplyAt) {
        replyTotal += ticket.firstAgentReplyAt - ticket.createdAt;
        replyCount += 1;
      }
      const day = utcDayKey(ticket.createdAt);
      if (activityByDay.has(day)) {
        activityByDay.set(day, (activityByDay.get(day) ?? 0) + 1);
      }
    }

    return {
      total: tickets.length,
      open: counts.open,
      pending: counts.pending,
      resolved: counts.resolved,
      closed: counts.closed,
      needingAttention,
      resolvedThisWeek,
      avgFirstReplyMinutes:
        replyCount === 0 ? null : Math.round(replyTotal / replyCount / 60000),
      oldestOpenAt,
      activity: Array.from(activityByDay, ([day, count]) => ({
        day,
        tickets: count,
      })),
      recent: tickets.slice(0, 5),
      queue: tickets
        .filter(
          (ticket) =>
            ticket.status === TICKET_STATUSES.OPEN ||
            ticket.status === TICKET_STATUSES.PENDING,
        )
        .slice(0, 5),
    };
  },
});

/** Agent only: load a small, realistic queue so the overview is not empty. */
export const seedSampleTickets = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAgent(ctx);

    const existing = await ctx.db.query("tickets").take(1);
    if (existing.length > 0) return { inserted: 0 };

    const now = Date.now();
    const hourMs = 60 * 60 * 1000;

    type Sample = {
      subject: string;
      customerName: string;
      customerEmail: string;
      body: string;
      status: TicketStatus;
      priority: TicketPriority;
      hoursAgo: number;
      agentReply?: { body: string; delayHours: number };
    };

    const samples: Sample[] = [
      {
        subject: "Cannot export invoices to CSV",
        customerName: "Priya Raman",
        customerEmail: "priya@northwind.io",
        body: "The export button on the invoices page spins forever and nothing downloads. We need the CSV for our quarterly filing. Chrome 128 on macOS.",
        status: TICKET_STATUSES.OPEN,
        priority: TICKET_PRIORITIES.HIGH,
        hoursAgo: 3,
      },
      {
        subject: "Password reset email never arrives",
        customerName: "Marcus Webb",
        customerEmail: "marcus@bluepeak.co",
        body: "I requested a reset link three times in the last hour and nothing shows up, not even in spam. Locked out of my workspace.",
        status: TICKET_STATUSES.OPEN,
        priority: TICKET_PRIORITIES.URGENT,
        hoursAgo: 6,
      },
      {
        subject: "Billing: charged twice for August",
        customerName: "Dana Whitfield",
        customerEmail: "dana@lumenlabs.dev",
        body: "Our card was charged twice on August 4th for the same Pro subscription. Order IDs are 8812 and 8813. Please refund the duplicate.",
        status: TICKET_STATUSES.PENDING,
        priority: TICKET_PRIORITIES.URGENT,
        hoursAgo: 30,
        agentReply: {
          body: "Thanks for flagging this, Dana. I can see both charges and I've issued a refund for the duplicate, which should land in 3-5 business days. I'll confirm here once the processor acknowledges it.",
          delayHours: 1.5,
        },
      },
      {
        subject: "API rate limit feels low on Pro plan",
        customerName: "Tobias Lind",
        customerEmail: "tobias@stackfern.se",
        body: "We hit 429s during our nightly sync even though the docs say Pro includes 10x the requests. Can you check our account limits?",
        status: TICKET_STATUSES.OPEN,
        priority: TICKET_PRIORITIES.HIGH,
        hoursAgo: 52,
      },
      {
        subject: "Webhooks retrying with stale payloads",
        customerName: "Ana Ferreira",
        customerEmail: "ana@paloma.app",
        body: "After a failed delivery our endpoint receives the old payload on retry, so we process the same event twice with outdated data.",
        status: TICKET_STATUSES.PENDING,
        priority: TICKET_PRIORITIES.NORMAL,
        hoursAgo: 76,
        agentReply: {
          body: "Great catch — retries were serializing the event snapshot from the first attempt. We're shipping a fix this week and I'll note it here when it's live.",
          delayHours: 5,
        },
      },
      {
        subject: "Dashboard charts blank on Safari",
        customerName: "Kenji Watanabe",
        customerEmail: "kenji@orbitsystems.jp",
        body: "Every chart on the analytics dashboard renders as an empty box in Safari 17, but it works fine in Chrome.",
        status: TICKET_STATUSES.RESOLVED,
        priority: TICKET_PRIORITIES.NORMAL,
        hoursAgo: 96,
        agentReply: {
          body: "This was a rendering quirk with our chart library on Safari 17. We've deployed a fix — please hard refresh and let me know if the charts appear.",
          delayHours: 3,
        },
      },
      {
        subject: "How do I invite the rest of my team?",
        customerName: "Sofia Marchetti",
        customerEmail: "sofia@fresco.design",
        body: "We just upgraded and I can't find where to add teammates. Is there a seat limit on the Pro plan?",
        status: TICKET_STATUSES.RESOLVED,
        priority: TICKET_PRIORITIES.LOW,
        hoursAgo: 120,
        agentReply: {
          body: "Settings → Members → Invite, and Pro includes 10 seats. Invites expire after 7 days, so you can resend any that go unaccepted.",
          delayHours: 2,
        },
      },
      {
        subject: "Import fails on files larger than 5MB",
        customerName: "Grace Adeyemi",
        customerEmail: "grace@halcyonhq.com",
        body: "Our contact import silently stops at 5MB. Nothing in the UI explains the limit and the file uploads fine at 4.8MB.",
        status: TICKET_STATUSES.OPEN,
        priority: TICKET_PRIORITIES.NORMAL,
        hoursAgo: 150,
      },
      {
        subject: "Feature request: dark mode",
        customerName: "Oliver Grant",
        customerEmail: "oliver@tidalwave.io",
        body: "Any chance of a dark theme? Half our team works late and the white interface is rough on the eyes.",
        status: TICKET_STATUSES.CLOSED,
        priority: TICKET_PRIORITIES.LOW,
        hoursAgo: 240,
        agentReply: {
          body: "Dark mode is on the roadmap but not scheduled yet. I'll add your account to the beta list and close this for now — reply anytime to reopen it.",
          delayHours: 20,
        },
      },
      {
        subject: "SSO setup for our workspace",
        customerName: "Helena Vasquez",
        customerEmail: "helena@arkwright.co",
        body: "We're migrating to Okta and need SAML SSO. Is that available on the Business plan, and what do you need from our IT team?",
        status: TICKET_STATUSES.PENDING,
        priority: TICKET_PRIORITIES.LOW,
        hoursAgo: 300,
        agentReply: {
          body: "SAML SSO is included with Business. Send me your Okta metadata URL and I'll walk your IT team through the connection.",
          delayHours: 8,
        },
      },
    ];

    let inserted = 0;
    for (const sample of samples) {
      const createdAt = now - sample.hoursAgo * hourMs;
      const ticketId = await ctx.db.insert("tickets", {
        reference: randomReference(),
        subject: sample.subject,
        customerName: sample.customerName,
        customerEmail: sample.customerEmail,
        status: sample.status,
        priority: sample.priority,
        messageCount: sample.agentReply ? 2 : 1,
        lastMessagePreview: preview(sample.agentReply?.body ?? sample.body),
        lastActivityAt: sample.agentReply
          ? createdAt + sample.agentReply.delayHours * hourMs
          : createdAt,
        firstAgentReplyAt: sample.agentReply
          ? createdAt + sample.agentReply.delayHours * hourMs
          : undefined,
        resolvedAt:
          sample.status === TICKET_STATUSES.RESOLVED
            ? createdAt + sample.agentReply!.delayHours * hourMs
            : undefined,
        createdAt,
      });

      await ctx.db.insert("ticketMessages", {
        ticketId,
        authorType: "customer",
        authorName: sample.customerName,
        body: sample.body,
        createdAt,
      });

      if (sample.agentReply) {
        await ctx.db.insert("ticketMessages", {
          ticketId,
          authorType: "agent",
          authorName: "Support agent",
          body: sample.agentReply.body,
          createdAt: createdAt + sample.agentReply.delayHours * hourMs,
        });
      }

      inserted += 1;
    }

    return { inserted };
  },
});

export type TicketDoc = Doc<"tickets">;
export type TicketMessageDoc = Doc<"ticketMessages">;
export type TicketId = Id<"tickets">;
