"use client";

import { PROJECTS_HOVER_ITEMS } from "@/components/common/main-sidebar";
import { ShareDialog } from "@/components/common/share-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProjectDetails } from "@/hooks/useProjectDetails";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { HeartCrack, PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { use, useState } from "react";

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

  const { project, members, isLoading, isError } = useProjectDetails(projectId);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  return (
    <div className="w-full h-full flex flex-col">
      {/* HEADER */}
      <div className="flex flex-col px-8 py-6 gap-3">
        {isLoading && (
          <div className="m-auto flex items-center gap-1.5">
            <Spinner className="w-4 h-4 text-muted-foreground" />

            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        )}

        {isError && !project && !members && (
          <div className="m-auto flex items-center gap-1.5">
            <HeartCrack className="w-4 h-4 text-muted-foreground" />

            <span className="text-sm text-muted-foreground">
              Failed to fetch project details
            </span>
          </div>
        )}

        {project && (
          <h1 className="text-4xl font-bold tracking-tight">{project.title}</h1>
        )}

        {members && (
          <AvatarGroup>
            {members.map((member) => (
              <HoverCard>
                <HoverCardTrigger delay={100} closeDelay={100}>
                  <Avatar>
                    <AvatarImage src={member.profiles.profile_image_url} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </HoverCardTrigger>

                <HoverCardContent className="w-auto flex flex-col gap-2">
                  <div className="flex flex-col justify-center items-center gap-0.5">
                    <span className="text-sm font-medium">
                      {member.profiles.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {member.profiles.email}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Role
                      </span>

                      <span className="text-sm ">{member.role}</span>
                    </div>

                    <div className="flex justify-between items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        Joined at
                      </span>

                      <span className="text-sm ">
                        {format(new Date(member.joined_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ))}

            <Tooltip>
              <TooltipTrigger>
                <AvatarGroupCount
                  onClick={() => setIsShareDialogOpen(true)}
                  className="cursor-pointer"
                >
                  <PlusIcon />
                </AvatarGroupCount>
              </TooltipTrigger>

              <TooltipContent side="right">Add members</TooltipContent>
            </Tooltip>
          </AvatarGroup>
        )}
      </div>

      {/* NAVIGATIONS */}
      <nav className="w-full h-[3rem] border-b px-8 flex justify items-center gap-2">
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

      <ShareDialog
        projectId={projectId}
        projectName={project?.title!}
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
      />
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
