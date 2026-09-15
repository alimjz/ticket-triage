import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";

export type TeamMember = {
  _id: Id<"users">;
  name: string;
  email: string;
};

/** Sentinel inside the select for "nobody owns this yet". */
export const NO_OWNER = "unassigned";

/** Every account in the workspace, for owner pickers. */
export function useTeamMembers(): TeamMember[] {
  return useQuery(api.tickets.teamMembers) ?? [];
}

export function AssigneeSelect({
  members,
  value,
  onChange,
  size = "default",
  className,
}: {
  members: TeamMember[];
  value?: Id<"users">;
  onChange: (assigneeId: Id<"users"> | null) => void;
  size?: "sm" | "default";
  className?: string;
}) {
  return (
    <Select
      value={value ?? NO_OWNER}
      onValueChange={(next) =>
        onChange(next === NO_OWNER ? null : (next as Id<"users">))
      }
    >
      <SelectTrigger size={size} className={className}>
        <SelectValue placeholder="Unassigned" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NO_OWNER}>Unassigned</SelectItem>
        {members.map((member) => (
          <SelectItem key={member._id} value={member._id}>
            {member.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
