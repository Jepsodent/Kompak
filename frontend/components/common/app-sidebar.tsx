"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, ChevronDown, X, Folder } from "lucide-react";
import { CURRENT_USER } from "@/constants/users.constant";
import { MAIN_NAV } from "@/constants/sidebar.constant";
import { useUIStore } from "@/lib/stores/navbar.store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getColor } from "@/lib/utils";
import { useDashboard } from "@/hooks/useDashboard";
import { useCreateProject } from "@/hooks/useCreateProject";
import { useProfile } from "@/hooks/useProfile";

export function AppSidebar() {
  const pathname = usePathname();
  const { data } = useDashboard();
  const { handleCreateProject, isCreating } = useCreateProject();

  const { data: profile, isLoading, error: profileError } = useProfile();
  if (!isLoading) {
    console.log("Profile: " + profile?.profile_image_url);
    console.log("Profile: " + profile?.name);
    console.log("Error: " + profileError);
  }

  const projects = data?.recent_projects || [];
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const visible = projects.slice(0, 3);
  const overflow = projects.slice(3);

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 border-r border-border flex-col bg-card/60 backdrop-blur-xl transition-transform duration-300 md:relative md:translate-x-0",
          !sidebarOpen && "-translate-x-full",
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-foreground rounded-lg flex items-center justify-center">
              <div className="size-3 border-2 border-background rounded-full" />
            </div>
            <span className="font-display font-bold tracking-tight text-lg">
              Kompak
            </span>
          </div>

          <button
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="px-4 space-y-1">
          {MAIN_NAV.map((item) => (
            <Link
              key={item.url}
              href={item.url}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(item.url)
                  ? "bg-foreground/5 text-foreground"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              }`}
            >
              <item.icon className="size-4" />
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="mt-8 px-4">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              My Projects
            </span>
            <button
              onClick={handleCreateProject}
              className="size-5 flex items-center justify-center hover:bg-foreground/5 rounded transition-colors text-muted-foreground"
              aria-label="Create project"
              disabled={isCreating}
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <div className="space-y-0.5">
            {visible.map((p) => {
              const active = pathname === `/projects/${p.id}`;
              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    active
                      ? "bg-foreground/5 text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  <span
                    className={`size-2 rounded-full ring-4 shrink-0 ${getColor(p.id)}`}
                  />
                  <span className="truncate">{p.title}</span>
                </Link>
              );
            })}
            {visible.length === 0 && overflow.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-6 px-4 mt-4 text-center border border-dashed border-border/60 rounded-lg bg-foreground/[0.01]">
                {/* Ikon folder berukuran sedang dengan warna pudar */}
                <Folder className="size-5 text-muted-foreground/30 stroke-[1.5]" />

                {/* Teks utama */}
                <span className="text-xs font-medium text-muted-foreground/80">
                  No projects created
                </span>

                {/* Instruksi tambahan */}
                <span className="text-[10px] text-muted-foreground/50 leading-normal max-w-[150px]">
                  Click the &quot;+&quot; button above to start your first
                  project
                </span>
              </div>
            )}

            {overflow.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full text-left px-3 py-2 text-xs text-muted-foreground/80 hover:text-foreground flex items-center gap-2 mt-1 rounded-md hover:bg-foreground/5 transition-colors">
                    View more spaces
                    <ChevronDown className="size-3 opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-56 max-h-64 overflow-y-auto"
                >
                  {overflow.map((p) => (
                    <DropdownMenuItem key={p.id} asChild>
                      <Link
                        href={`/projects/${p.id}`}
                        className="flex items-center gap-2"
                      >
                        <span
                          className={`size-2 rounded-full ring-2 ${getColor(p.id)}`}
                        />
                        <span className="truncate">{p.title}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="mt-auto p-4 border-t border-border">
          {isLoading ? (
            /* Loading Skeleton State */
            <div className="flex items-center gap-3 px-2 animate-pulse">
              <div className="size-9 rounded-full bg-muted" />
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <div className="h-3 w-24 bg-muted rounded" />
                <div className="h-2.5 w-16 bg-muted/60 rounded" />
              </div>
            </div>
          ) : profileError || !profile ? (
            /* Error or Empty Fallback State */
            <div className="text-[11px] text-destructive px-2 truncate">
              Failed to load profile
            </div>
          ) : (
            /* Live Dynamic Profile State */
            <div className="flex items-center gap-3 px-2">
              {profile.profile_image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={profile.profile_image_url}
                  alt={`${profile.name}'s avatar`}
                  className="size-9 rounded-full object-cover ring-1 ring-border"
                />
              ) : (
                /* Text Initials Fallback if no avatar image exists */
                <div className="size-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-xs font-semibold text-primary outline-1 -outline-offset-1 outline-white/10">
                  {profile.name
                    ? profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "U"}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold truncate text-foreground">
                  {profile.name || "User"}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  Pro Plan
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
