import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

/** Separator Convex Auth uses when a session id is appended to the subject. */
const TOKEN_SUB_CLAIM_DIVIDER = ":";

/**
 * Resolves the signed-in identity to a users row.
 *
 * Two flavors share this resolver:
 * - Convex Auth (legacy email-code sign-in) puts a users id in the subject,
 *   optionally as `<id>:<sessionId>`, and getAuthUserId resolved it directly.
 * - Custom JWT providers such as Clerk put their own user id there (e.g.
 *   `user_2abc...`), so the row is looked up by tokenIdentifier and created on
 *   first sight — one account per external identity.
 */
async function currentUserId(
  ctx: QueryCtx | MutationCtx,
): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) return null;
  const subject = identity.subject;

  // Flavor 1: the subject is already a users id.
  const direct = await ctx.db.normalizeId("users", subject);
  if (direct !== null) return direct;

  // Flavor 1b: subject is `<users id>:<session id>`.
  const [localPart] = subject.split(TOKEN_SUB_CLAIM_DIVIDER);
  const local = await ctx.db.normalizeId("users", localPart ?? "");
  if (local !== null) return local;

  // Flavor 2: an external provider subject — find the linked account.
  const linked = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", subject))
    .unique();
  if (linked !== null) return linked._id;

  // Clerk user ids look like `user_...`; any other subject is not something we
  // auto-provision, so treat it as signed out.
  if (!localPart?.startsWith("user_")) return null;

  return await ctx.db.insert("users", { tokenIdentifier: subject });
}

/**
 * Throws unless the caller is signed in; returns the users id. The error text
 * matches what the catalog tests assert on.
 */
export async function requireUserId(
  ctx: QueryCtx | MutationCtx,
): Promise<Id<"users">> {
  const userId = await currentUserId(ctx);
  if (userId === null) {
    throw new ConvexError("Sign in to use Intake.");
  }
  return userId;
}

/**
 * Runs on Clerk sign-in (and on first load of a Clerk session): provisions the
 * account if it does not exist yet and keeps name/email current. Safe to call
 * repeatedly; it only patches when something actually changed.
 */
export const syncClerkUser = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    const patch: { name?: string; email?: string } = {};
    const name = args.name?.trim();
    const email = args.email?.trim();
    if (name) patch.name = name;
    if (email) patch.email = email;

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(userId, patch);
    }
    return userId;
  },
});
