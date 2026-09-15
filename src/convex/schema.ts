import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

// support ticket vocabulary
export const TICKET_STATUSES = {
  OPEN: "open", // new, awaiting first agent reply
  PENDING: "pending", // agent replied, waiting on the customer
  RESOLVED: "resolved",
  CLOSED: "closed",
} as const;

export const ticketStatusValidator = v.union(
  v.literal(TICKET_STATUSES.OPEN),
  v.literal(TICKET_STATUSES.PENDING),
  v.literal(TICKET_STATUSES.RESOLVED),
  v.literal(TICKET_STATUSES.CLOSED),
);
export type TicketStatus = Infer<typeof ticketStatusValidator>;

export const TICKET_PRIORITIES = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export const ticketPriorityValidator = v.union(
  v.literal(TICKET_PRIORITIES.LOW),
  v.literal(TICKET_PRIORITIES.NORMAL),
  v.literal(TICKET_PRIORITIES.HIGH),
  v.literal(TICKET_PRIORITIES.URGENT),
);
export type TicketPriority = Infer<typeof ticketPriorityValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // support tickets submitted by customers
    tickets: defineTable({
      reference: v.string(), // short human friendly id, e.g. TCK-8F3KQ
      subject: v.string(),
      customerName: v.string(),
      customerEmail: v.string(),
      status: ticketStatusValidator,
      priority: ticketPriorityValidator,
      messageCount: v.number(),
      lastMessagePreview: v.string(),
      lastActivityAt: v.number(),
      firstAgentReplyAt: v.optional(v.number()),
      resolvedAt: v.optional(v.number()),
      createdAt: v.number(),
    })
      .index("by_status", ["status"])
      .index("by_reference", ["reference"])
      .index("by_last_activity", ["lastActivityAt"]),

    // the conversation thread for a ticket
    ticketMessages: defineTable({
      ticketId: v.id("tickets"),
      authorType: v.union(v.literal("customer"), v.literal("agent")),
      authorName: v.string(),
      body: v.string(),
      createdAt: v.number(),
    }).index("by_ticket", ["ticketId", "createdAt"]),

    // add other tables here

    // tableName: defineTable({
    //   ...
    //   // table fields
    // }).index("by_field", ["field"])
  },
  {
    schemaValidation: false,
  },
);

export default schema;
