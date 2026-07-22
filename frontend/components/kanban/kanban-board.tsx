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
import { Task } from "@/types/task.type";
import { useUpdateTask } from "@/hooks/useTask";

const COLUMNS = [
  {
    id: "e152eec0-fb60-4839-ba14-427a5d503f3a",
    code: "TODO",
    name: "To Do",
  },
  {
    id: "18c3c0ec-8740-42a0-bb07-aee692f70f69",
    code: "IN_PROGRESS",
    name: "In Progress",
  },
  {
    id: "355bf6db-1a52-415d-987e-0a999482ae5f",
    code: "IN_REVIEW",
    name: "In Review",
  },
  {
    id: "e6eea38c-f626-43b6-a2d2-19e1b440b6aa",
    code: "DONE",
    name: "Done",
  },
];

interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
  onEditTask?: (task: Task) => void;
}

export default function KanbanBoard({
  projectId,
  tasks,
  setTasks,
  onEditTask,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [previousTasks, setPreviousTasks] = useState<Task[]>([]);

  const updateTaskMutation = useUpdateTask(projectId);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const handleDragStart = (e: DragStartEvent) => {
    const task = tasks.find((t) => t.id === e.active.id);
    if (task) {
      setActiveTask(task);
      setPreviousTasks(tasks);
    }
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

    // Determine target column status:
    // If hovering over another task card, use its status object.
    // If hovering over an empty column area, find the column object by ID.
    const targetColumn = overTask
      ? overTask.status
      : COLUMNS.find((col) => col.id === overId);
    if (!targetColumn) return;

    // If task is moved to a DIFFERENT column status:
    if (activeTask.status.id !== targetColumn.id) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);

        // Immutably copy state and update status to reflect new column immediately
        const updated = [...prev];
        updated[activeIndex] = {
          ...updated[activeIndex],
          status: targetColumn,
        };

        return arrayMove(updated, activeIndex, activeIndex);
      });
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    // PART 1: Handles UI Logic
    const { active, over } = e;
    setActiveTask(null);

    if (!over) return;

    const activeIndex = tasks.findIndex((t) => t.id === active.id);
    const overIndex = tasks.findIndex((t) => t.id === over.id);

    // Reorder array if order changed
    let updatedTasks = tasks;
    if (activeIndex !== overIndex) {
      updatedTasks = arrayMove(tasks, activeIndex, overIndex);
      setTasks(updatedTasks);
    }

    // PART 2: Backend Patch, do we put it right here?
    const droppedTask = updatedTasks.find((t) => t.id === active.id);
    const initialTask = previousTasks.find((t) => t.id === active.id);

    // Only fire PATCH request if column status actually changed
    if (
      droppedTask &&
      initialTask &&
      droppedTask.status?.id !== initialTask.status?.id
    ) {
      updateTaskMutation.mutate(
        {
          taskId: droppedTask.id,
          payload: { status_id: droppedTask.status.id },
        },
        {
          onError: () => {
            setTasks(previousTasks);
          },
        },
      );
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
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            projectId={projectId}
            id={col.id}
            title={col.name}
            tasks={tasks.filter((t) => t.status?.id === col.id)}
            onEditTask={onEditTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCard projectId={projectId} task={activeTask} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
