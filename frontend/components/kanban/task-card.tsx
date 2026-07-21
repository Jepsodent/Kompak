import { Task } from "@/types/kanban.type";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
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
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 ring-1 ring-foreground/10 rounded-md cursor-grab text-secondary-foreground active:cursor-grabbing hover:bg-primary hover:text-primary-foreground duration-300 transition-all"
    >
      <p className="text-base">{task.content}</p>
    </div>
  );
}
