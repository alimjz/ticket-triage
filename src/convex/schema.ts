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

// ticket vocabulary
export const TICKET_STATUSES = {
  OPEN: "open", // logged, nobody has picked it up yet
  PENDING: "pending", // answered, waiting on the requester
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

    // the catalog: every ticket the team has logged
    tickets: defineTable({
      reference: v.string(), // short human friendly id, e.g. INT-8F3KQ
      subject: v.string(),
      requesterId: v.optional(v.id("users")), // who logged it
      customerName: v.string(), // requester display name
      customerEmail: v.string(), // requester contact address
      assigneeId: v.optional(v.id("users")), // teammate who owns it
      status: ticketStatusValidator,
      priority: ticketPriorityValidator,
      messageCount: v.number(),
      lastMessagePreview: v.string(),
      lastActivityAt: v.number(),
      firstResponseAt: v.optional(v.number()), // first comment from someone other than the requester
      resolvedAt: v.optional(v.number()),
      createdAt: v.number(),
    })
      .index("by_status", ["status"])
      .index("by_reference", ["reference"])
      .index("by_last_activity", ["lastActivityAt"])
      .index("by_requester", ["requesterId"])
      .index("by_assignee", ["assigneeId"]),

    // the comment thread on a ticket
    ticketMessages: defineTable({
      ticketId: v.id("tickets"),
      authorId: v.optional(v.id("users")),
      authorName: v.string(),
      body: v.string(),
      createdAt: v.number(),
    }).index("by_ticket", ["ticketId", "createdAt"]),

    // files uploaded alongside a ticket
    attachments: defineTable({
      ticketId: v.id("tickets"),
      uploadedBy: v.optional(v.id("users")),
      storageId: v.id("_storage"),
      name: v.string(),
      size: v.number(),
      contentType: v.optional(v.string()),
      createdAt: v.number(),
    }).index("by_ticket", ["ticketId"]),

    // personal todos, always scoped to one teammate
    todos: defineTable({
      ownerId: v.id("users"),
      title: v.string(),
      note: v.optional(v.string()),
      done: v.boolean(),
      dueAt: v.optional(v.number()),
      ticketId: v.optional(v.id("tickets")), // optionally linked to a ticket
      createdAt: v.number(),
      completedAt: v.optional(v.number()),
    })
      .index("by_owner", ["ownerId"])
      .index("by_owner_done", ["ownerId", "done"]),

    // add other tables here
  },
  {
    schemaValidation: false,
  },
);

export default schema;
