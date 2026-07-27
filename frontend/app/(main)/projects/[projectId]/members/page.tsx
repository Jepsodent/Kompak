"use client";

import { ColumnDef, DataTable } from "@/components/common/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASKS } from "@/constants/tasks.constant";
import { useMember } from "@/hooks/useMember";
import { useProfile } from "@/hooks/useProfile";
import { useProjectDetails } from "@/hooks/useProjectDetails";
import { getColor, getInitials } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { use } from "react";

type MembersPage = {
  params: Promise<{ projectId: string }>;
};

const statusTone: Record<string, string> = {
  TODO: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-primary/10 text-primary",
  REVIEW: "bg-amber-500/10 text-amber-300",
  DONE: "bg-emerald-500/10 text-emerald-300",
};

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function MembersPage({ params }: MembersPage) {
  const { projectId } = use(params);

  const { project, members, isLoading, isError } = useProjectDetails(projectId);

  // console.log(members)
  const { kickMember, updateRole } = useMember(projectId);
  const { data: CURRENT_USER } = useProfile();

  const canManage = members.some(
    (m) => m.profile_id === CURRENT_USER?.id && m.role === "LEADER",
  );

  // nanti di integrasiin kalo udah ada endpointnya
  const tasks = TASKS.filter((t) => t.projectId === projectId);

  function changeRole(profileId: string, role: "LEADER" | "MEMBER") {
    updateRole({ memberId: profileId, role });
  }

  function removeMember(profileId: string) {
    kickMember(profileId);
  }

  // Instead of HTML table, we use DataTable for tasks!
  const columns: ColumnDef<(typeof tasks)[0]>[] = [
    {
      header: "Task",
      accessorKey: "title",
      className: "font-medium text-foreground",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (t) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusTone[t.status]}`}
        >
          {t.status.replace("_", " ")}
        </span>
      ),
    },
    {
      header: "Assignee",
      accessorKey: "assigneeId",
      cell: (t) => {
        const a = members.find((m) => m.id === t.assigneeId);
        if (!a) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <div className="flex items-center gap-2">
            <div
              className={`size-6 rounded-full ${getColor(a.id)} flex items-center justify-center text-[10px] font-semibold overflow-hidden shrink-0`}
            >
              {a.profiles.profile_image_url ? (
                <img
                  src={a.profiles.profile_image_url}
                  alt={a.profiles.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(a.profiles.name)
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {a.profiles.name}
            </span>
          </div>
        );
      },
    },
    {
      header: "Due",
      accessorKey: "dueDate",
      cell: (t) => (
        <span className="text-muted-foreground text-xs">
          {formatDay(t.dueDate)}
        </span>
      ),
    },
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
                className={`size-9 rounded-full ${getColor(m.id)} flex items-center justify-center text-xs font-semibold shrink-0 overflow-hidden`}
              >
                {m.profiles.profile_image_url ? (
                  <img
                    src={m.profiles.profile_image_url}
                    alt={m.profiles.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(m.profiles.name)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {m.profiles.name}
                  {m.profile_id === CURRENT_USER?.id && (
                    <span className="ml-2 text-[10px] text-muted-foreground">
                      (you)
                    </span>
                  )}
                </p>
              </div>
              {canManage && m.profile_id !== CURRENT_USER?.id ? (
                <>
                  <Select
                    value={m.role}
                    onValueChange={(v) => changeRole(m.profile_id, v as Role)}
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
                    onClick={() => removeMember(m.profile_id)}
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
        <DataTable
          columns={columns}
          data={tasks}
          className="border-0 shadow-none rounded-none bg-transparent"
        />
      </section>
    </div>
  );
}
