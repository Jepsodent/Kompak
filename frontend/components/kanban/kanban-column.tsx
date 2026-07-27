import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskCard from "./task-card";
import { Task } from "@/types/task.type";
import { COLUMN_STYLES } from "./kanban-color";
import { Dispatch, SetStateAction } from "react";

interface KanbanColumnProps {
  projectId: string;
  id: string;
  title: string;
  tasks: Task[];
  onEditTask?: (task: Task) => void;

  selectedTaskId: string | null;
  setSelectedTaskId: Dispatch<SetStateAction<string | null>>;
  isEditTaskDialog: boolean;
  setIsEditTaskDialog: Dispatch<SetStateAction<boolean>>;
  isDeleteTaskDialogOpen: boolean;
  setIsDeleteTaskDialogOpen: Dispatch<SetStateAction<boolean>>;
}

export default function KanbanColumn({
  projectId,
  id,
  title,
  tasks,
  onEditTask,
  selectedTaskId,
  setSelectedTaskId,
  isEditTaskDialog,
  setIsEditTaskDialog,
  isDeleteTaskDialogOpen,
  setIsDeleteTaskDialogOpen,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });
  const taskIds = tasks.map((t) => t.id);

  const currentStyle = COLUMN_STYLES[id] || {
    bg: "bg-card",
    border: "border border-card-foreground/10",
  };

  return (
    <div
      ref={setNodeRef}
      className={`w-full min-w-[300px] max-w-[350px] min-h-[600px] flex flex-col gap-4 p-4 ${currentStyle.bg} text-card-foreground rounded-xl ${currentStyle.border}`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center pb-2 border-b border-card-foreground/10">
        <h2 className="text-lg font-semibold">{title}</h2>

        <span className="text-sm">{tasks.length}</span>
      </div>

      {/* CONTENT: List of TaskCard */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 flex-1">
          {tasks.map((task) => (
            <TaskCard
              projectId={projectId}
              key={task.id}
              task={task}
              selectedTaskId={selectedTaskId}
              setSelectedTaskId={setSelectedTaskId}
              isEditTaskDialog={isEditTaskDialog}
              setIsEditTaskDialog={setIsEditTaskDialog}
              isDeleteTaskDialogOpen={isDeleteTaskDialogOpen}
              setIsDeleteTaskDialogOpen={setIsDeleteTaskDialogOpen}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
