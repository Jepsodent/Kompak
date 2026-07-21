import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import TaskCard from "./task-card";
import KanbanColumn from "./kanban-column";
import { ColumnId, Task } from "@/types/kanban.type";

const COLUMNS: ColumnId[] = ["todo", "in-progress", "done"];

interface KanbanBoardProps {
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
}

export default function KanbanBoard({ tasks, setTasks }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<any | null>(null);

  // Avoid SSR hydration issues with dnd-kit auto-generated IDs
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const handleDragStart = (e: DragStartEvent) => {
    const task = tasks.find((t) => t.id === e.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t.id === activeId);
    const overTask = tasks.find((t) => t.id === overId);
    if (!activeTask) return;

    // Check if dropping over another task or over an empty column
    const overColumnId = overTask ? overTask.columnId : (overId as ColumnId);
    if (activeTask.columnId !== overColumnId) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);

        // Immutable update
        const updated = [...prev];
        updated[activeIndex] = {
          ...updated[activeIndex],
          columnId: overColumnId,
        };

        return arrayMove(updated, activeIndex, activeIndex);
      });
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveTask(null);

    const { active, over } = e;
    if (!over) return;

    const activeIndex = tasks.findIndex((t) => t.id === active.id);
    const overIndex = tasks.findIndex((t) => t.id === over.id);
    if (activeIndex !== overIndex) {
      setTasks((prev) => arrayMove(prev, activeIndex, overIndex));
    }
  };

  if (!mounted) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4">
        {COLUMNS.map((colId) => (
          <KanbanColumn
            key={colId}
            id={colId}
            tasks={tasks.filter((t) => t.columnId === colId)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
