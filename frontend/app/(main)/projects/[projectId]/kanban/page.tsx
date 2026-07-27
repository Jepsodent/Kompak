"use client";

import { use, useEffect, useState } from "react";
import KanbanBoard from "@/components/kanban/kanban-board";
import { useCreateTask, useGenerateTask, useTasks } from "@/hooks/useTask";
import { Task } from "@/types/task.type";
import EditTaskSheet from "@/components/tasks/edit-task.sheet";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import GenerateTaskDialog from "@/components/tasks/generate-task-dialog";
import DeleteTaskDialog from "@/components/tasks/delete-task-dialog";
import { ButtonGroup } from "@/components/ui/button-group";

interface KanbanPageProps {
  params: Promise<{ projectId: string }>;
}

export default function KanbanPage({ params }: KanbanPageProps) {
  const { projectId } = use(params);

  const {
    data: fetchedTasks,
    isLoading: isTasksLoading,
    isError: tasksError,
  } = useTasks(projectId);
  const {
    mutateAsync: createTask,
    isPending: isCreateTaskPending,
    isError: createTaskError,
  } = useCreateTask(projectId);
  const {
    mutateAsync: generateTask,
    isPending: isGenerateTaskPending,
    isError: generateTaskError,
  } = useGenerateTask(projectId);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isGenerateTaskDialogOpen, setIsGenerateTaskDialogOpen] =
    useState(false);
  const [isEditTaskSheetOpen, setIsEditTaskSheetOpen] = useState(false);
  const [isDeleteTaskDialogOpen, setIsDeleteTaskDialogOpen] = useState(false);

  // Local state for DnD smooth animations
  const [tasks, setTasks] = useState<Task[]>([]);
  useEffect(() => {
    if (fetchedTasks) {
      setTasks(fetchedTasks);
    }
  }, [fetchedTasks]);

  return (
    <div className="w-full h-full flex flex-col gap-2">
      {/* TOOLBAR */}
      <div className="w-full h-[3rem] flex justify-between items-center">
        <div className="flex items-center gap-2"></div>

        <ButtonGroup orientation="horizontal">
          <Button
            type="button"
            variant="default"
            disabled={isGenerateTaskPending}
            onClick={() => setIsGenerateTaskDialogOpen(true)}
            className="cursor-pointer"
          >
            Generate Task
          </Button>

          <Button
            type="button"
            variant="secondary"
            disabled={isCreateTaskPending}
            onClick={() => createTask()}
            className="cursor-pointer"
          >
            {isCreateTaskPending ? (
              <div className="flex items-center gap-1.5">
                <Spinner />
                <span>Creating...</span>
              </div>
            ) : (
              "Create Task"
            )}
          </Button>
        </ButtonGroup>
      </div>

      {/* BOARD */}
      <KanbanBoard
        projectId={projectId}
        tasks={tasks}
        setTasks={setTasks}
        onEditTask={(task) => setSelectedTaskId(task.id)}
        selectedTaskId={selectedTaskId}
        setSelectedTaskId={setSelectedTaskId}
        isEditTaskDialog={isEditTaskSheetOpen}
        setIsEditTaskDialog={setIsEditTaskSheetOpen}
        isDeleteTaskDialogOpen={isDeleteTaskDialogOpen}
        setIsDeleteTaskDialogOpen={setIsDeleteTaskDialogOpen}
      />

      {/* HIDDEN */}
      <GenerateTaskDialog
        isGenerateTaskDialogOpen={isGenerateTaskDialogOpen}
        setIsGenerateTaskDialogOpen={setIsGenerateTaskDialogOpen}
      />

      <EditTaskSheet
        projectId={projectId}
        selectedTaskId={selectedTaskId}
        setSelectedTaskId={setSelectedTaskId}
        isEditTaskSheetOpen={isEditTaskSheetOpen}
        setIsEditTaskSheetOpen={setIsEditTaskSheetOpen}
      />

      <DeleteTaskDialog
        projectId={projectId}
        selectedTaskId={selectedTaskId}
        setSelectedTaskId={setSelectedTaskId}
        isDeleteTaskDialogOpen={isDeleteTaskDialogOpen}
        setIsDeleteTaskDialogOpen={setIsDeleteTaskDialogOpen}
      />
    </div>
  );
}
