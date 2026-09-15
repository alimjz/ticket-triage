import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";

async function requireUser(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new ConvexError("Sign in to use Intake.");
  }
  return userId;
}

export type TodoList = {
  items: Doc<"todos">[];
  open: number;
  done: number;
};

/** The signed-in teammate's own todo list: open first, then most recent. */
export const listMine = query({
  args: {},
  handler: async (ctx): Promise<TodoList> => {
    const userId = await requireUser(ctx);

    const todos = await ctx.db
      .query("todos")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    const items = todos.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return b.createdAt - a.createdAt;
    });

    return {
      items,
      open: items.filter((todo) => !todo.done).length,
      done: items.filter((todo) => todo.done).length,
    };
  },
});

export const createTodo = mutation({
  args: {
    title: v.string(),
    note: v.optional(v.string()),
    ticketId: v.optional(v.id("tickets")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);

    const title = args.title.trim();
    if (title.length < 2) {
      throw new ConvexError("Give the todo a title first.");
    }

    if (args.ticketId) {
      const ticket = await ctx.db.get(args.ticketId);
      if (ticket === null) {
        throw new ConvexError("That ticket no longer exists.");
      }
    }

    return await ctx.db.insert("todos", {
      ownerId: userId,
      title,
      note: args.note?.trim() || undefined,
      done: false,
      ticketId: args.ticketId,
      createdAt: Date.now(),
    });
  },
});

export const toggleTodo = mutation({
  args: { todoId: v.id("todos"), done: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);

    const todo = await ctx.db.get(args.todoId);
    if (todo === null || todo.ownerId !== userId) {
      throw new ConvexError("That todo is not on your list.");
    }

    await ctx.db.patch(args.todoId, {
      done: args.done,
      completedAt: args.done ? Date.now() : undefined,
    });
  },
});

export const deleteTodo = mutation({
  args: { todoId: v.id("todos") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);

    const todo = await ctx.db.get(args.todoId);
    if (todo === null) return;
    if (todo.ownerId !== userId) {
      throw new ConvexError("That todo is not on your list.");
    }

    await ctx.db.delete(args.todoId);
  },
});
