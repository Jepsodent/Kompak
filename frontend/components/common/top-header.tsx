"use client";

import { Bell, Plus, Search, Menu } from "lucide-react";
import { useState } from "react";
import { CreateProjectDialog } from "./create-project-dialog";
import Link from "next/link";
import { useUIStore } from "@/lib/stores/navbar.store";

export function TopHeader() {
  const [createOpen, setCreateOpen] = useState(false);
  const { toggleSidebar } = useUIStore();

  return (
    <>
      <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-8 bg-card/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <button 
            onClick={toggleSidebar}
            className="p-2 -ml-2 rounded-md hover:bg-foreground/5 md:hidden text-muted-foreground"
          >
            <Menu className="size-5" />
          </button>
          
          <div className="relative w-full max-w-sm hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60 pointer-events-none" />
            <input
              type="text"
              placeholder="Search projects, tasks…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-foreground/5 rounded-full border border-transparent focus:border-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/notifications"
            className="size-9 flex items-center justify-center hover:bg-foreground/5 rounded-full relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="size-4 text-muted-foreground" />
            <span className="size-1.5 bg-primary rounded-full absolute top-2 right-2.5" />
          </Link>
          <button
            onClick={() => setCreateOpen(true)}
            className="px-3.5 py-2 bg-primary text-primary-foreground rounded-full text-xs font-semibold hover:brightness-110 transition inline-flex items-center gap-1.5 shadow-lg shadow-primary/20"
          >
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">Create Project</span>
          </button>
        </div>
      </header>

      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
