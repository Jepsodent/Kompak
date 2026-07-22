"use client";

import { useState } from "react";
import { Task } from "@/types/task.type";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { format } from "date-fns";
import { useDeleteTask } from "@/hooks/useTask";

// UI Components
import { Button } from "../ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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

interface TaskCardProps {
  projectId: string; // Made required for delete mutation
  task: Task;
  onEditTask?: (task: Task) => void;
}

export default function TaskCard({
  projectId,
  task,
  onEditTask,
}: TaskCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteTaskMutation = useDeleteTask(projectId);

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

  const handleDelete = async () => {
    try {
      await deleteTaskMutation.mutateAsync(task.id);
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-slate-200 border-2 border-dashed border-slate-400 p-4 rounded-lg h-16"
      />
    );
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => onEditTask?.(task)}
        className="group relative flex flex-col p-4 ring-1 ring-foreground/10 rounded-md cursor-grab text-secondary-foreground active:cursor-grabbing hover:bg-primary hover:text-primary-foreground duration-300 transition-all"
      >
        <p className="text-base font-medium">{task.title}</p>

        <span className="text-sm text-muted-foreground block mt-1 group-hover:text-primary-foreground/80">
          Due {format(new Date(task.due_date), "MMM d, yyyy 'at' h:mm a")}
        </span>

        {/* Footer: Assignees on Left, Options Dropdown on Right */}
        <div className="flex items-center justify-between mt-4">
          {/* Assignees */}
          <div className="flex items-center gap-1.5 overflow-hidden">
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
                  <Avatar key={idx} className="h-6 w-6">
                    <AvatarImage
                      src={profile?.profile_image_url || undefined}
                    />
                    <AvatarFallback className="text-[10px] text-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                );
              })}
          </div>

          {/* Options Dropdown */}
          <div
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground group-hover:text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem
                  onClick={() => onEditTask?.(task)}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  <span>Edit</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task <strong className="text-foreground">"{task.title}"</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteTaskMutation.isPending ? "Deleting..." : "Delete Task"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
