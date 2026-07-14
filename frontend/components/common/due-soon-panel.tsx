"use client";

import { TASKS } from "@/constants/tasks.constant";
import { PROJECTS } from "@/constants/projects.constant";
import { Plus } from "lucide-react";

const priorityLabel: Record<string, { label: string; className: string }> = {
  HIGH: { label: "High Priority", className: "text-amber-400" },
  MEDIUM: { label: "Medium", className: "text-muted-foreground" },
  LOW: { label: "Routine", className: "text-muted-foreground" },
};

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function DueSoonPanel({ date }: { date: string }) {
  const items = TASKS.filter((t) => t.dueDate === date);

  return (
    <div className="bg-card p-6 rounded-2xl ring-1 ring-white/10 shadow-sm space-y-4 h-full flex flex-col">
      <h4 className="font-semibold flex items-center justify-between text-sm">
        Tasks Due Soon
        <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          {formatDay(date)}
        </span>
      </h4>

      <div className="space-y-3 animate-in fade-in flex-1" key={date}>
        {items.length === 0 && (
          <div className="text-xs flex items-center justify-center h-full text-muted-foreground ">
            Nothing due on this day.
          </div>
        )}
        {items.map((t) => {
          const project = PROJECTS.find((p) => p.id === t.projectId);
          const prio = priorityLabel[t.priority];
          return (
            <div
              key={t.id}
              className="p-3 rounded-xl border border-border hover:border-primary/30 transition-all cursor-pointer group bg-card"
            >
              <p className="text-xs font-medium mb-1 group-hover:text-primary transition-colors">
                {t.title}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">{project?.name}</span>
                <span className="size-1 bg-muted-foreground/30 rounded-full" />
                <span className={`text-[10px] ${prio.className}`}>{prio.label}</span>
              </div>
            </div>
          );
        })}
        
      </div>
    </div>
  );
}
