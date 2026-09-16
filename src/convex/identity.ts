import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

/** Separator Convex Auth uses when a session id is appended to the subject. */
const TOKEN_SUB_CLAIM_DIVIDER = ":";

/**
 * Resolves the signed-in identity to a users row. Read-only: it never
 * provisions, so it is safe inside queries.
 *
 * Two flavors share this resolver:
 * - Convex Auth (the built-in email-code sign-in) puts a users id in the
 *   subject, optionally as `<id>:<sessionId>`, and getAuthUserId resolved it
 *   directly.
 * - Custom JWT providers such as Clerk put their own user id there (e.g.
 *   `user_2abc...`), so the row is looked up by tokenIdentifier.
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
  return linked?._id ?? null;
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
 * Whether the request carries a verified identity at all, independent of
 * whether a users row exists yet. The client uses this to hold the UI until a
 * first-time Clerk sign-in has been provisioned (queries cannot write).
 */
export const identityState = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    return { hasIdentity: identity !== null };
  },
});

/**
 * Runs on Clerk sign-in: provisions the account the first time an external
 * identity is seen (one account per Clerk user id) and keeps name/email
 * current afterwards. Safe to call repeatedly; it only writes on change.
 */
export const syncClerkUser = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new ConvexError("Sign in to use Intake.");
    }
    const subject = identity.subject;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", subject))
      .unique();

    const patch: { name?: string; email?: string } = {};
    const name = args.name?.trim();
    const email = args.email?.trim();
    if (name) patch.name = name;
    if (email) patch.email = email;

    if (existing === null) {
      // Only external provider subjects are auto-provisioned; anything else
      // would be an attempt to mint accounts for arbitrary subjects.
      if (!subject.startsWith("user_")) {
        throw new ConvexError("This sign-in method cannot create an account.");
      }
      return await ctx.db.insert("users", {
        tokenIdentifier: subject,
        ...patch,
      });
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(existing._id, patch);
    }
    return existing._id;
  },
});
