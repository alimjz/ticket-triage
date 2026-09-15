import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Id } from "@/convex/_generated/dataModel";
import { NO_OWNER, type TeamMember } from "@/hooks/use-team-members";

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
