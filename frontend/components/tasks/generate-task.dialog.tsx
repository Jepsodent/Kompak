"use client";

import { RevampTaskFormValues } from "@/schemas/revamp-task.schema";
import RevampTaskCard from "../kanban/revamp-task-card";
import { Dialog, DialogContent } from "../ui/dialog";
import { GeneratedTask } from "@/types/task.type";
import { MagicLinkFormValues } from "@/schemas/auth.schema";

const TASKS: GeneratedTask[] = [
  {
    title: "Develop Wireframe",
    description: "Build the wirframe",
    recommendation_role: "Designer Boys boys",
  },
  {
    title: "Develop Backend",
    description: "Build the backend",
    recommendation_role: "Backend boys",
  },
  {
    title: "Develop Frontend",
    description: "Build the frontend",
    recommendation_role: "Frontend boys",
  },
];

type GenerateTaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function GenerateTaskDialog({
  open,
  onOpenChange,
}: GenerateTaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-full max-w-none! rounded-none flex flex-col lg:h-[800px] lg:w-[1000px] md:rounded-lg lg:flex-row  items-center">
        {/* GENERATED TASKS */}
        <div className="w-[40%] h-full">
          <h2 className="text-lg font-semibold">Generated Tasks</h2>

          <div className="mt-4 flex flex-col items-center gap-2">
            {TASKS.map((item) => (
              <RevampTaskCard key={item.title} task={item} />
            ))}
          </div>
        </div>

        {/* TASK EDITOR */}
        <div className="w-[60%] h-full flex flex-col items-center"></div>
      </DialogContent>
    </Dialog>
  );
}
