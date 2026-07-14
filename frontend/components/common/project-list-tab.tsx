"use client";

import { useState } from "react";
import type { Project } from "@/constants/projects.constant";
import type { Role } from "@/constants/users.constant";
import { TASKS } from "@/constants/tasks.constant";
import { CURRENT_USER } from "@/constants/users.constant";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type ColumnDef } from "@/components/common/data-table";

const statusTone: Record<string, string> = {
  TODO: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-primary/10 text-primary",
  REVIEW: "bg-amber-500/10 text-amber-300",
  DONE: "bg-emerald-500/10 text-emerald-300",
};

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ProjectListTab({ project }: { project: Project }) {
  const canManage = project.members.some(
    (m) => m.id === CURRENT_USER.id && m.role === "LEADER"
  );
  const [members, setMembers] = useState(project.members);
  const tasks = TASKS.filter((t) => t.projectId === project.id);

  function changeRole(id: string, role: Role) {
    setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, role } : m)));
    toast.success("Role updated");
  }

  function removeMember(id: string) {
    setMembers((ms) => ms.filter((m) => m.id !== id));
    toast.success("Member removed");
  }

  // Instead of HTML table, we use DataTable for tasks!
  const columns: ColumnDef<typeof tasks[0]>[] = [
    {
      header: "Task",
      accessorKey: "title",
      className: "font-medium text-foreground",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (t) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusTone[t.status]}`}>
          {t.status.replace("_", " ")}
        </span>
      ),
    },
    {
      header: "Assignee",
      accessorKey: "assigneeId",
      cell: (t) => {
        const a = project.members.find((m) => m.id === t.assigneeId);
        if (!a) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <div className="flex items-center gap-2">
            <div className={`size-6 rounded-full ${a.color} flex items-center justify-center text-[10px] font-semibold`}>
              {a.initials}
            </div>
            <span className="text-xs text-muted-foreground">{a.name}</span>
          </div>
        );
      },
    },
    {
      header: "Due",
      accessorKey: "dueDate",
      cell: (t) => <span className="text-muted-foreground text-xs">{formatDay(t.dueDate)}</span>,
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Team Overview */}
      <section className="bg-card rounded-2xl ring-1 ring-white/10 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Team</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {members.length} members
            </p>
          </div>
        </div>
        <div className="divide-y divide-border">
          {members.map((m) => (
            <div key={m.id} className="px-6 py-3 flex items-center gap-4">
              <div
                className={`size-9 rounded-full ${m.color} flex items-center justify-center text-xs font-semibold shrink-0`}
              >
                {m.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {m.name}
                  {m.id === CURRENT_USER.id && (
                    <span className="ml-2 text-[10px] text-muted-foreground">(you)</span>
                  )}
                </p>
              </div>
              {canManage && m.id !== CURRENT_USER.id ? (
                <>
                  <Select
                    value={m.role}
                    onValueChange={(v) => changeRole(m.id, v as Role)}
                  >
                    <SelectTrigger className="w-32 h-8 text-xs bg-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="LEADER">Leader</SelectItem>
                    </SelectContent>
                  </Select>
                  <button
                    onClick={() => removeMember(m.id)}
                    className="size-8 flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Remove member"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {m.role}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* All Tasks */}
      <section className="bg-card rounded-2xl ring-1 ring-white/10 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">All Tasks</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {tasks.length} tasks across this project
            </p>
          </div>
          <span className="text-[10px] text-muted-foreground italic">
            List view
          </span>
        </div>
        <DataTable columns={columns} data={tasks} className="border-0 shadow-none rounded-none bg-transparent" />
      </section>
    </div>
  );
}
