import { ProjectMember } from "@/types/project.type";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Users } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface MultiSelectAssigneesProps {
  members: ProjectMember[];
  value?: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export default function MultiSelectAssignees({
  members,
  value = [],
  onChange,
  disabled,
}: MultiSelectAssigneesProps) {
  const activeMembers = members.filter((m) => m.membership_status === "ACTIVE");

  const toggleMember = (memberId: string) => {
    if (value.includes(memberId)) {
      onChange(value.filter((id) => id !== memberId));
    } else {
      onChange([...value, memberId]);
    }
  };

  const selectedCount = value.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled || activeMembers.length === 0}
          className="flex items-center"
        >
          <Users className="mr-1 h-4 w-4" />

          {selectedCount === 0 ? (
            <span className="text-sm">Select assignees...</span>
          ) : (
            <span className="text-sm">
              {selectedCount} member{selectedCount > 1 ? "s" : ""} selected
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-2" align="end">
        <div className="flex flex-col items-start gap-2">
          {activeMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground p-2 text-center">
              No active project members found.
            </p>
          ) : (
            activeMembers.map((member) => {
              const isChecked = value.includes(member.id);
              const name = member.profiles?.name || "Unknown Member";
              const initials = name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

              return (
                <div
                  key={member.id}
                  onClick={() => toggleMember(member.id)}
                  className="w-full flex items-center gap-2 p-2 rounded-md hover:ring hover:ring-foreground  cursor-pointer"
                >
                  <Checkbox
                    id={`assignee-${member.id}`}
                    checked={isChecked}
                    onCheckedChange={() => toggleMember(member.id)}
                    className="mr-2"
                  />

                  <Avatar size="default">
                    <AvatarImage src={member.profiles?.profile_image_url} />
                    <AvatarFallback className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col">
                    <span className="text-sm truncate">{name}</span>

                    <span className="text-xs  text-muted-foreground truncate">
                      {member.profiles?.email}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
