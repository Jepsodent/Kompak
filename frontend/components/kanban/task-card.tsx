"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Task } from "@/types/task.type";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { format } from "date-fns";
import { useDeleteTask } from "@/hooks/useTask";

import { Button } from "../ui/button";
import {
  MoreHorizontal,
  Pencil,
  PencilIcon,
  Trash,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { ButtonGroup } from "../ui/button-group";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { COLUMN_STYLES } from "./kanban-color";
import { toast } from "../ui/toast";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  projectId: string;
  selectedTaskId: string | null;
  setSelectedTaskId: Dispatch<SetStateAction<string | null>>;
  isEditTaskDialog: boolean;
  setIsEditTaskDialog: Dispatch<SetStateAction<boolean>>;
  isDeleteTaskDialogOpen: boolean;
  setIsDeleteTaskDialogOpen: Dispatch<SetStateAction<boolean>>;
}

export default function TaskCard({
  task,
  selectedTaskId,
  setSelectedTaskId,
  setIsEditTaskDialog,
  setIsDeleteTaskDialogOpen,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-card-foreground rounded-lg h-16"
      />
    );
  }

  const currentStyle = COLUMN_STYLES[task.status.id];

  const isActive = selectedTaskId === task.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        `${currentStyle.border} flex flex-col p-3 rounded-lg cursor-grabbing ${currentStyle.bg} text-card-foreground active:cursor-grabbing duration-300 transition-all`,
        `${currentStyle.hover}`,
        isActive && "ring-1 ring-foreground",
      )}
    >
      <p className="text-base line-clamp-2">{task.title}</p>

      <span className="block mt-1 text-sm text-muted-foreground">
        Due {format(new Date(task.due_date), "MMM d, yyyy 'at' h:mm a")}
      </span>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4">
        {/* Assignees */}
        <div className="flex items-center gap-2 overflow-hidden">
          {task.assignees &&
            task.assignees.length > 0 &&
            task.assignees.map((assignee, idx) => {
              const profile = assignee.member?.profile;
              const initials =
                profile?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase() || "?";

              return (
                <HoverCard>
                  <HoverCardTrigger delay={50} closeDelay={50}>
                    <Avatar
                      key={idx}
                      size="default"
                      className="border border-card-foreground/10"
                    >
                      <AvatarImage
                        src={profile?.profile_image_url || undefined}
                      />

                      <AvatarFallback className="text-sm text-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </HoverCardTrigger>

                  <HoverCardContent
                    side="bottom"
                    align="center"
                    className="w-auto text-xs"
                  >
                    {profile.name}
                  </HoverCardContent>
                </HoverCard>
              );
            })}
        </div>

        {/* Edit and Delete Buttons */}
        <ButtonGroup
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="ml-auto"
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedTaskId(task.id);
              setIsEditTaskDialog(true);
            }}
            aria-label="Edit task"
            size="icon"
            className="cursor-pointer"
          >
            <PencilIcon />
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedTaskId(task.id);
              setIsDeleteTaskDialogOpen(true);
            }}
            aria-label="Delete Task"
            size="icon"
            className="cursor-pointer"
          >
            <Trash />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
