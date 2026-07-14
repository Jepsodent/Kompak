"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Project, QuickLink } from "@/constants/projects.constant";
import { TASKS } from "@/constants/tasks.constant";
import { EditableText } from "./editable-text";
import { toast } from "sonner";

export function ProjectSummaryTab({ project }: { project: Project }) {
  const tasks = TASKS.filter(t => t.projectId === project.id);
  const total = tasks.length || 1;
  const done = tasks.filter((t) => t.status === "DONE").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const todo = tasks.filter((t) => t.status === "TODO").length;
  const review = tasks.filter((t) => t.status === "REVIEW").length;
  const completion = Math.round((done / total) * 100);

  const [links, setLinks] = useState<QuickLink[]>(project.quickLinks);

  // Mock updateProject for now
  const updateProject = (id: string, updates: Partial<Project>) => {
    toast.success(`Project ${Object.keys(updates).join(", ")} updated (mock)`);
  };

  function addLink() {
    const title = window.prompt("Link title?");
    if (!title) return;
    setLinks((l) => [
      {
        id: `l-${Date.now()}`,
        title,
        url: "#",
        addedBy: "You",
        updatedAt: "just now",
        action: "added",
      },
      ...l,
    ]);
    toast.success("Link added");
  }

  function editLink(id: string) {
    const link = links.find((l) => l.id === id);
    if (!link) return;
    const title = window.prompt("Edit title", link.title);
    if (!title) return;
    setLinks((ls) =>
      ls.map((l) =>
        l.id === id ? { ...l, title, updatedAt: "just now", addedBy: "You", action: "updated" } : l
      )
    );
    toast.success("Link updated");
  }

  function deleteLink(id: string) {
    setLinks((ls) => ls.filter((l) => l.id !== id));
    toast.success("Link removed");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
      {/* Grid Atas */}
      <div className="lg:col-span-7 bg-card rounded-2xl ring-1 ring-white/10 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Progress & Overview</h3>
          <span className="text-xs font-medium text-emerald-400">{completion}% complete</span>
        </div>
        <div className="h-2.5 w-full bg-foreground/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-1000"
            style={{ width: `${completion}%` }}
          />
        </div>
        <div className="grid grid-cols-4 gap-4 pt-2">
          <Stat label="Todo" value={todo} dot="bg-muted-foreground/40" />
          <Stat label="In Progress" value={inProgress} dot="bg-primary" />
          <Stat label="Review" value={review} dot="bg-amber-500/100" />
          <Stat label="Done" value={done} dot="bg-emerald-500/100" />
        </div>
      </div>

      <div className="lg:col-span-5 bg-card rounded-2xl ring-1 ring-white/10 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Task Distribution</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/5 text-muted-foreground">
            {total} tasks
          </span>
        </div>
        <Donut todo={todo} inProgress={inProgress} review={review} done={done} />
      </div>

      {/* Grid Bawah */}
      <div className="lg:col-span-7 space-y-10 p-2">
        <EditableSection
          title="Objective"
          body={project.objective}
          // large -> jd gede / putih warnanya
          onSave={(v) => updateProject(project.id, { objective: v })}
        />
        <EditableSection
          title="Method"
          body={project.method}
          onSave={(v) => updateProject(project.id, { method: v })}
        />
        <EditableSection
          title="Expected Result"
          body={project.expectedResult}
          onSave={(v) => updateProject(project.id, { expectedResult: v })}
        />
      </div>

      <div className="lg:col-span-5">
        <div className="bg-card rounded-2xl ring-1 ring-white/10 shadow-sm overflow-hidden sticky top-4">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h4 className="text-sm font-semibold">Quick Links</h4>
            <button
              onClick={addLink}
              className="text-[11px] font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              <Plus className="size-3" /> Add
            </button>
          </div>
          <div className="p-2">
            {links.length === 0 && (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No links yet. Add one to keep resources together.
              </div>
            )}
            {links.map((l) => (
              <div
                key={l.id}
                className="group flex items-start justify-between p-3 rounded-lg hover:bg-background/60 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <a href={l.url} className="text-sm font-medium hover:text-primary transition-colors block truncate">
                    {l.title}
                  </a>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {l.action === "added" ? "Added by" : "Last updated by"} {l.addedBy} · {l.updatedAt}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => editLink(l.id)}
                    className="size-6 flex items-center justify-center rounded hover:bg-foreground/5 text-muted-foreground hover:text-foreground"
                    aria-label="Edit link"
                  >
                    <Pencil className="size-3" />
                  </button>
                  <button
                    onClick={() => deleteLink(l.id)}
                    className="size-6 flex items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    aria-label="Delete link"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, dot }: { label: string; value: number; dot: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`size-1.5 rounded-full ${dot}`} />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-display font-bold tracking-tight">{value}</div>
    </div>
  );
}

function EditableSection({
  title,
  body,
  large = false,
  onSave,
}: {
  title: string;
  body: string;
  large?: boolean;
  onSave: (v: string) => void;
}) {
  return (
    <section>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
        {title}
      </h3>
      <EditableText
        value={body}
        onSave={onSave}
        multiline
        label={title}
        placeholder={`Add ${title.toLowerCase()}…`}
        textClassName={`text-pretty leading-relaxed max-w-[62ch] ${
          large ? "text-lg text-foreground" : "text-base text-foreground/80"
        }`}
      />
    </section>
  );
}

function Donut({
  todo,
  inProgress,
  review,
  done,
}: {
  todo: number;
  inProgress: number;
  review: number;
  done: number;
}) {
  const total = Math.max(todo + inProgress + review + done, 1);
  const segments = [
    { key: "todo", value: todo, color: "oklch(0.55 0.02 258)", label: "Todo" },
    { key: "in", value: inProgress, color: "oklch(0.6 0.19 258)", label: "In Progress" },
    { key: "review", value: review, color: "oklch(0.78 0.15 75)", label: "Review" },
    { key: "done", value: done, color: "oklch(0.7 0.16 155)", label: "Done" },
  ];

  let cumulative = 0;
  const stops = segments.map((s) => {
    const from = (cumulative / total) * 100;
    cumulative += s.value;
    const to = (cumulative / total) * 100;
    return `${s.color} ${from}% ${to}%`;
  });

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0">
        <div
          className="size-32 rounded-full"
          style={{ background: `conic-gradient(${stops.join(", ")})` }}
        />
        <div className="absolute inset-3 rounded-full bg-card flex flex-col items-center justify-center">
          <span className="text-2xl font-display font-bold tracking-tight">{total}</span>
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground">tasks</span>
        </div>
      </div>
      <div className="space-y-2 flex-1 min-w-0">
        {segments.map((s) => (
          <div key={s.key} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 min-w-0">
              <span className="size-2 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-muted-foreground truncate">{s.label}</span>
            </span>
            <span className="font-semibold tabular-nums">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
