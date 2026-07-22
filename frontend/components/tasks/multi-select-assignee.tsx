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
          className="w-full justify-start text-left font-normal"
        >
          <Users className="mr-2 h-4 w-4" />
          {selectedCount === 0 ? (
            <span className="text-muted-foreground">Select assignees...</span>
          ) : (
            <span>
              {selectedCount} member{selectedCount > 1 ? "s" : ""} selected
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[300px] p-2" align="start">
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {activeMembers.length === 0 ? (
            <p className="text-xs text-muted-foreground p-2 text-center">
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
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Checkbox
                    id={`assignee-${member.id}`}
                    checked={isChecked}
                    onCheckedChange={() => toggleMember(member.id)}
                  />
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.profiles?.profile_image_url} />
                    <AvatarFallback className="text-[10px]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-xs overflow-hidden">
                    <span className="font-medium truncate">{name}</span>
                    <span className="text-muted-foreground text-[10px] truncate">
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
