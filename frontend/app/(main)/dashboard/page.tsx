"use client";

import Link from "next/link";
import { useState } from "react";
import { DataTable, type ColumnDef } from "@/components/common/data-table";
import { DashboardCalendar } from "./_components/dashboard-calendar";
import { DueSoonPanel } from "./_components/due-soon-panel";
import { CURRENT_USER } from "@/constants/users.constant";
import { DashboardRecentProject } from "@/types/dashboard.type";
import { useDashboard } from "@/hooks/useDashboard";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}


const columns: ColumnDef<DashboardRecentProject>[] = [
  {
    header: "Project Name",
    accessorKey: "title",
    cell: (p) => (
      <Link href={`/projects/${p.id}`} className="hover:text-primary transition-colors font-medium">
        {p.title}
      </Link>
    ),
  },
  {
    header: "Joined Date",
    accessorKey: "joined_at",
    cell: (p) => formatDate(p.joined_at),
  },
  {
    header: "Team",
    accessorKey: "member_profile_image",
    cell: (p) => {
      const avatars = p.member_profile_image || [];
      const showCount = Math.min(avatars.length, 5);
      const excess = avatars.length - 5;
      
      return (
        <div className="flex -space-x-2">
          {avatars.slice(0, showCount).map((url, i) => (
            <div key={i} className="size-6 rounded-full ring-2 ring-background bg-foreground/10 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {url ? <img src={url} alt="member" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary/20" />}
            </div>
          ))}
          {excess > 0 && (
            <div className="size-6 rounded-full ring-2 ring-background bg-foreground/5 flex items-center justify-center text-[9px] font-semibold text-muted-foreground">
              +{excess}
            </div>
          )}
        </div>
      );
    },
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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0,10));
  const {data, loading ,error} = useDashboard()
  console.log(data)
  if(error){
    return <div className="p-12 text-center text-sm text-red-500 h-[50vh] flex items-center justify-center">{error}</div>; 
  }
  if(loading || !data){
    return <div className="p-12 text-center text-sm text-muted-foreground h-[50vh] flex items-center justify-center">Loading dashboard...</div>;
  }
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
        <StatCard label="Total Projects" value={data.total_projects} sub="active memberships" />
        <StatCard
          label="My Unfinished Tasks"
          value={data.my_total_tasks}
          sub="across all projects"
          accent="warning"
        />
      </section>

      {/* Middle */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardCalendar selectedDate={selectedDate} onSelect={setSelectedDate} />
        </div>
        <div>
          <DueSoonPanel date={selectedDate} tasks={data.tasks_due_soon} />
        </div>
      </section>

      {/* Recent Projects */}
      <section className="bg-card rounded-2xl ring-1 ring-white/10 shadow-sm overflow-hidden overflow-x-auto">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between min-w-[600px]">
          <h4 className="text-sm font-semibold">Recent Projects</h4>
        </div>
        <div className="min-w-[600px] overflow-hidden group">
          <DataTable columns={columns} data={data.recent_projects} className="border-0 shadow-none rounded-none bg-transparent" />
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
