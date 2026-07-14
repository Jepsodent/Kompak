"use client";

import type { Project } from "@/constants/projects.constant";
import { TASKS, type TaskStatus } from "@/constants/tasks.constant";

const columns: { status: TaskStatus; label: string; accent: string }[] = [
  { status: "TODO", label: "Todo", accent: "bg-muted-foreground/50" },
  { status: "IN_PROGRESS", label: "In Progress", accent: "bg-primary" },
  { status: "REVIEW", label: "Review", accent: "bg-amber-500/100" },
  { status: "DONE", label: "Done", accent: "bg-emerald-500/100" },
];

const prioTone: Record<string, string> = {
  HIGH: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  MEDIUM: "text-primary bg-primary/10 border-primary/20",
  LOW: "text-muted-foreground bg-foreground/5 border-border",
};

export function ProjectBoardTab({ project }: { project: Project }) {
  const tasks = TASKS.filter((t) => t.projectId === project.id);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 animate-in fade-in">
      {columns.map((col) => {
        const items = tasks.filter((t) => t.status === col.status);
        return (
          <div key={col.status} className="bg-card rounded-2xl ring-1 ring-white/10 shadow-sm p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${col.accent}`} />
                <span className="text-xs font-semibold uppercase tracking-widest">{col.label}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{items.length}</span>
              </div>
              <button className="text-muted-foreground hover:text-foreground text-lg leading-none">+</button>
            </div>
            <div className="space-y-2.5 flex-1">
              {items.map((t) => {
                const assignee = project.members.find((m) => m.id === t.assigneeId);
                return (
                  <div
                    key={t.id}
                    className="group p-3 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all cursor-grab active:cursor-grabbing"
                  >
                    <p className="text-sm font-medium leading-snug mb-3">{t.title}</p>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${prioTone[t.priority]}`}
                      >
                        {t.priority}
                      </span>
                      {assignee && (
                        <div
                          className={`size-6 rounded-full ${assignee.color} flex items-center justify-center text-[10px] font-semibold`}
                          title={assignee.name}
                        >
                          {assignee.initials}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {items.length === 0 && (
                <div className="text-[11px] text-muted-foreground text-center py-6">
                  Nothing here yet.
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
