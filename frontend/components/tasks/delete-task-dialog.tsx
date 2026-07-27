import { Dispatch, SetStateAction } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useDeleteTask } from "@/hooks/useTask";
import { toast } from "../ui/toast";
import { Spinner } from "../ui/spinner";
import { Trash2Icon } from "lucide-react";

type DeleteTaskDialogProps = {
  projectId: string;
  selectedTaskId: string | null;
  setSelectedTaskId: Dispatch<SetStateAction<string | null>>;
  isDeleteTaskDialogOpen: boolean;
  setIsDeleteTaskDialogOpen: Dispatch<SetStateAction<boolean>>;
};

export default function DeleteTaskDialog({
  projectId,
  selectedTaskId,
  setSelectedTaskId,
  isDeleteTaskDialogOpen,
  setIsDeleteTaskDialogOpen,
}: DeleteTaskDialogProps) {
  const {
    mutateAsync: deleteTask,
    isPending: isDeleteTaskPending,
    error: deleteTaskError,
  } = useDeleteTask(projectId);

  const handleDelete = async () => {
    try {
      await deleteTask(selectedTaskId!);
      toast.add({
        type: "success",
        description: "Task has been deleted",
      });

      setIsDeleteTaskDialogOpen(false);
      setSelectedTaskId(null);
    } catch (error) {
      toast.add({
        type: "delete",
        description: "Failed to delete task",
      });

      console.log("Error: " + deleteTaskError);
      console.log("TaskId: " + selectedTaskId);
    }
  };

  return (
    <AlertDialog
      open={isDeleteTaskDialogOpen}
      onOpenChange={setIsDeleteTaskDialogOpen}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete Task?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this chat conversation.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => {
              setIsDeleteTaskDialogOpen(false);
              setSelectedTaskId(null);
            }}
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            type="button"
            variant="destructive"
            disabled={isDeleteTaskPending}
            onClick={handleDelete}
            className="cursor-pointer"
          >
            {isDeleteTaskPending ? (
              <div className="flex items-center gap-1.5">
                <Spinner />
                <span>Deleting...</span>
              </div>
            ) : (
              "Delete Task"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
