"use client";

import Link from "next/link";
import { useState } from "react";
import { DataTable, type ColumnDef } from "@/components/common/data-table";
import { DashboardCalendar } from "./_components/dashboard-calendar";
import { DueSoonPanel } from "./_components/due-soon-panel";
import { PROJECTS } from "@/constants/projects.constant";
import { TASKS } from "@/constants/tasks.constant";
import { CURRENT_USER } from "@/constants/users.constant";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

type DashboardRecentProject = {
  id: string;
  title: string;
  joined_at: string;
  member_profile_image: string[];
};

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
  const [selectedDate, setSelectedDate] = useState("2024-08-08");
  
  const unfinished = TASKS.filter((t) => t.assigneeId === CURRENT_USER.id && t.status !== "DONE");
  
  // Map mock data to the new backend format for now
  const recent: DashboardRecentProject[] = PROJECTS.slice(0, 4).map((p) => ({
    id: p.id,
    title: p.name,
    joined_at: p.joinedDate,
    // Provide some fake URLs or empty strings for testing the UI based on member count
    member_profile_image: p.members.map(() => "")
  }));

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
        <StatCard label="Total Projects" value={PROJECTS.length} sub="active memberships" />
        <StatCard
          label="My Unfinished Tasks"
          value={unfinished.length}
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
