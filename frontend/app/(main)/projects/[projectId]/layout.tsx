"use client";

import { PROJECTS_HOVER_ITEMS } from "@/components/common/main-sidebar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { use } from "react";

type ProjectLayoutProps = {
  params: Promise<{ projectId: string }>;
  children: React.ReactNode;
};

export default function ProjectLayout({
  params,
  children,
}: ProjectLayoutProps) {
  const { projectId } = use(params);
  const pathname = usePathname();

  return (
    <div className="w-full h-full flex flex-col ">
      {/* NAVIGATIONS */}
      <nav className="w-full h-[3rem] mt-3 border-b px-8 flex justify items-center gap-2">
        {PROJECTS_HOVER_ITEMS.map((item) => {
          const href = item.getHref(projectId);
          const isRootProject = href === `/projects/${projectId}`;

          const active = isRootProject
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={item.name}
              href={item.getHref(projectId)}
              className={cn(
                "h-full px-3 rounded-md flex items-center transition-all duration-200",
                "hover:bg-foreground/5",
                active &&
                  "border-b-2 border-b-foreground font-semibold bg-foreground/5",
              )}
            >
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="w-full h-full px-8 py-4">{children}</div>
    </div>
  );
}

// <div className="flex h-screen w-full bg-background overflow-hidden">
//   {/* Sidebar nongkrong di kiri */}
//   <AppSidebar />

//   {/* Wrapper konten utama di kanan */}
//   <div className="flex-1 flex flex-col min-w-0 h-full">
//     <TopHeader />
//     <main className="flex-1 overflow-y-auto relative">
//       {children}
//     </main>
//   </div>

//   <Toaster />
// </div>
