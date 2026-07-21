import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskCard from "./task-card";
import { ColumnId, Task } from "@/types/kanban.type";

const COLUMN_TITLES: Record<ColumnId, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};

interface KanbanColumnProps {
  id: ColumnId;
  tasks: Task[];
}

export default function KanbanColumn({ id, tasks }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });
  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      className="min-w-[300px] min-h-[500px] flex flex-col gap-4 p-4 bg-card rounded-xl ring-1 ring-foreground/10"
    >
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-base">{COLUMN_TITLES[id]}</h2>

        <span className="text-xs">{tasks.length}</span>
      </div>

      {/* CONTENT */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
