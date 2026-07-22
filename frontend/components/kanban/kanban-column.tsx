import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskCard from "./task-card";
import { Task } from "@/types/task.type";

interface KanbanColumnProps {
  projectId: string;
  id: string;
  title: string;
  tasks: Task[];
  onEditTask?: (task: Task) => void;
}

export default function KanbanColumn({
  projectId,
  id,
  title,
  tasks,
  onEditTask,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });
  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      className="min-w-[300px] min-h-[500px] flex flex-col flex-1 gap-4 p-4 bg-card rounded-xl ring-1 ring-foreground/10"
    >
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-base">{title}</h2>
        <span className="text-xs">{tasks.length}</span>
      </div>

      {/* CONTENT */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 flex-1">
          {tasks.map((task) => (
            <TaskCard
              projectId={projectId}
              key={task.id}
              task={task}
              onEditTask={onEditTask}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
