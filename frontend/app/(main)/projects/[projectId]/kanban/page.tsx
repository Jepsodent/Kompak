"use client";

import { Task } from "@/types/kanban.type";
import { useState } from "react";
import KanbanBoard from "@/components/kanban/kanban-board";

const INITIAL_TASKS: Task[] = [
  { id: "1", columnId: "todo", content: "Design landing page" },
  { id: "2", columnId: "todo", content: "Review pull requests" },
  { id: "3", columnId: "in-progress", content: "Setup Next.js app" },
  { id: "4", columnId: "done", content: "Initial research" },
];

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  if (!tasks) return <p>No tasks found!</p>;

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-xl font-bold ">Kanban Board</h2>

      <KanbanBoard tasks={tasks} setTasks={setTasks} />
    </div>
  );
}
