import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";

export type TeamMember = {
  _id: Id<"users">;
  name: string;
  email: string;
};

/** Sentinel value inside owner pickers for "nobody owns this yet". */
export const NO_OWNER = "unassigned";

const EMPTY: TeamMember[] = [];

/** Every account in the workspace, for owner pickers. */
export function useTeamMembers(): TeamMember[] {
  return useQuery(api.tickets.teamMembers) ?? EMPTY;
}
