import { ConvexError } from "convex/values";

/** Describe a thrown value for the user, preferring the server message. */
export function errorMessage(error: unknown, fallback: string) {
  if (error instanceof ConvexError) {
    const data = error.data;
    return typeof data === "string" && data.length > 0 ? data : fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
