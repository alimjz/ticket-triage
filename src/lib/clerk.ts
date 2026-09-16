/**
 * The app ships with the platform's built-in email-code sign-in. When Clerk
 * credentials are present in the environment, the client switches to Clerk for
 * sign-in while Convex keeps validating identities server-side. Everything
 * downstream of `useAuth()` is identical in both flavors.
 */
export function isClerkConfigured(): boolean {
  return Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
}
