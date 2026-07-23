"use client";

import { use, useEffect, useState } from "react";
import KanbanBoard from "@/components/kanban/kanban-board";
import CreateTaskSheet from "@/components/tasks/create-task.sheet";
import { useTasks } from "@/hooks/useTask";
import { Task } from "@/types/task.type";
import EditTaskSheet from "@/components/tasks/edit-task.sheet";

interface KanbanPageProps {
  params: Promise<{ projectId: string }>;
}

export default function KanbanPage({ params }: KanbanPageProps) {
  const { projectId } = use(params);
  const { data: fetchedTasks, isLoading, isError } = useTasks(projectId);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Local state for DnD smooth animations
  const [tasks, setTasks] = useState<Task[]>([]);
  useEffect(() => {
    if (fetchedTasks) {
      setTasks(fetchedTasks);
    }
  }, [fetchedTasks]);

  if (isLoading) return <p className="p-8">Loading tasks...</p>;
  if (isError) return <p className="p-8 text-red-500">Failed to load tasks.</p>;
  console.log(tasks);

  return (
    <div className="p-8 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold ">Board</h2>
        <CreateTaskSheet projectId={projectId} />
      </div>

      <KanbanBoard
        projectId={projectId}
        tasks={tasks}
        setTasks={setTasks}
        onEditTask={(task) => setSelectedTaskId(task.id)}
      />

      <EditTaskSheet
        projectId={projectId}
        taskId={selectedTaskId}
        open={!!selectedTaskId}
        onOpenChange={(open) => !open && setSelectedTaskId(null)}
      />
    </div>
  );
}
