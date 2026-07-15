"use client";

import Link from "next/link";
import { useState } from "react";
import { DataTable, type ColumnDef } from "@/components/common/data-table";
import { Project } from "@/constants/projects.constant";
import { DashboardCalendar } from "./_components/dashboard-calendar";
import { DueSoonPanel } from "./_components/due-soon-panel";
import { PROJECTS } from "@/constants/projects.constant";
import { TASKS } from "@/constants/tasks.constant";
import { CURRENT_USER } from "@/constants/users.constant";

const statusStyle: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  PLANNING: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  ARCHIVED: "bg-muted text-muted-foreground border-border",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

const columns: ColumnDef<Project>[] = [
  {
    header: "Project Name",
    accessorKey: "name",
    cell: (p) => (
      <Link href={`/projects/${p.id}`} className="hover:text-primary transition-colors font-medium">
        {p.name}
      </Link>
    ),
  },
  {
    header: "Joined Date",
    accessorKey: "joinedDate",
    cell: (p) => formatDate(p.joinedDate),
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: (p) => (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle[p.status]}`}>
        {p.status}
      </span>
    ),
  },
  {
    header: "",
    className: "text-right",
    cell: (p) => (
      <Link
        href={`/projects/${p.id}`}
        className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium"
      >
        Open →
      </Link>
    ),
  },
];

export default function DashboardPage() {
  // Setup default date to 2024-08-08 as in Lovable or use current date
  const [selectedDate, setSelectedDate] = useState("2024-08-08");
  
  const unfinished = TASKS.filter((t) => t.assigneeId === CURRENT_USER.id && t.status !== "DONE");
  const recent = PROJECTS.slice(0, 4);

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1800px] mx-auto">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/70">
          Good afternoon, {CURRENT_USER.name.split(" ")[0]}
        </p>
        <h1 className="mt-1 text-2xl md:text-3xl font-display font-bold tracking-tight">
          Dashboard
        </h1>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatCard label="Total Projects" value={PROJECTS.length} sub={`${PROJECTS.filter(p => p.status === "ACTIVE").length} active`} />
        <StatCard
          label="My Unfinished Tasks"
          value={unfinished.length}
          sub={`${unfinished.filter(t => t.priority === "HIGH").length} high priority`}
          accent="warning"
        />
      </section>

      {/* Middle */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardCalendar selectedDate={selectedDate} onSelect={setSelectedDate} />
        </div>
        <div>
          <DueSoonPanel date={selectedDate} />
        </div>
      </section>

      {/* Recent Projects */}
      <section className="bg-card rounded-2xl ring-1 ring-white/10 shadow-sm overflow-hidden overflow-x-auto">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between min-w-[600px]">
          <h4 className="text-sm font-semibold">Recent Projects</h4>
          <span className="text-xs text-muted-foreground">Showing {recent.length} of {PROJECTS.length}</span>
        </div>
        <div className="min-w-[600px] overflow-hidden group">
          <DataTable columns={columns} data={recent} className="border-0 shadow-none rounded-none bg-transparent" />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent = "success",
}: {
  label: string;
  value: number;
  sub: string;
  accent?: "success" | "warning";
}) {
  return (
    <div className="bg-card p-6 rounded-2xl ring-1 ring-white/10 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      <h3 className="text-4xl md:text-5xl font-display font-bold tracking-tight">{value}</h3>
      <p
        className={`text-[10px] mt-2 font-medium ${
          accent === "success" ? "text-emerald-400" : "text-amber-400"
        }`}
      >
        {sub}
      </p>
    </div>
  );
}
