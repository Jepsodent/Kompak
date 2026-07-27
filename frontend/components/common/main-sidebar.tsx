"use client";

import {
  Bell,
  CirclePlus,
  LayoutDashboard,
  LogOutIcon,
  Palette,
  Settings,
  UserPen,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { useDashboard } from "@/hooks/useDashboard";
import { Spinner } from "../ui/spinner";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useProfile } from "@/hooks/useProfile";
import { logOut } from "@/app/(auth)/actions";
import { Avatar, AvatarImage } from "../ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { useCreateProject } from "@/hooks/useCreateProject";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { ButtonGroup } from "../ui/button-group";
import { Button } from "../ui/button";

const APPLICATION_NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
];

const SETTINGS_DROPDOWN_ITEMS = [
  {
    name: "Profile",
    href: "/settings/profile",
    icon: UserPen,
  },
  {
    name: "Account",
    href: "/settings/account",
    icon: Settings,
  },
  {
    name: "Appearance",
    href: "/settings/appearance",
    icon: Palette,
  },
];

export const PROJECTS_HOVER_ITEMS = [
  {
    name: "Summary",
    getHref: (projectId: string) => `/projects/${projectId}/summary`,
  },
  {
    name: "Members",
    getHref: (projectId: string) => `/projects/${projectId}/members`,
  },
  {
    name: "Kanban",
    getHref: (projectId: string) => `/projects/${projectId}/kanban`,
  },
  {
    name: "Contributions",
    getHref: (projectId: string) => `/projects/${projectId}/contributions`,
  },
];

export default function MainSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    data: dashboardData,
    loading: isDashboardLoading,
    error: dashboardError,
  } = useDashboard();

  const {
    handleCreateProject: createProject,
    isCreating: isCreateProjectLoading,
  } = useCreateProject();

  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
  } = useProfile();

  return (
    <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="w-full flex items-center gap-3">
            <div className="size-7 bg-foreground rounded-lg flex justify-center items-center">
              <div className="size-3 border-2 border-background rounded-full" />
            </div>

            <span className="text-xl font-bold tracking-tight">Kompak</span>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>

          <SidebarMenu>
            {APPLICATION_NAV_ITEMS.map((item) => {
              const active = pathname === item.href;

              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    onClick={() => router.push(item.href)}
                    isActive={active}
                    className="cursor-pointer"
                  >
                    <item.icon /> <span>{item.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel>
              <CollapsibleTrigger className="cursor-pointer">
                Projects
              </CollapsibleTrigger>
            </SidebarGroupLabel>

            <SidebarGroupAction
              disabled={isCreateProjectLoading}
              onClick={createProject}
            >
              {isCreateProjectLoading ? (
                <Spinner />
              ) : (
                <CirclePlus className="cursor-pointer w-4 h-4 text-muted-foreground" />
              )}
            </SidebarGroupAction>

            <CollapsibleContent>
              <SidebarMenu>
                {isDashboardLoading && (
                  <SidebarMenuItem>
                    <Spinner className="m-auto w-4 h-4" />
                  </SidebarMenuItem>
                )}

                {dashboardError && !dashboardData && (
                  <SidebarMenuItem>
                    <span className="block w-full text-center text-sm text-muted-foreground">
                      Failed to fetch projects :(
                    </span>
                  </SidebarMenuItem>
                )}

                {!isDashboardLoading &&
                  !dashboardError &&
                  dashboardData?.recent_projects?.length === 0 && (
                    <SidebarMenuItem>
                      <span className="block w-full text-center text-sm text-muted-foreground">
                        No recent projects
                      </span>
                    </SidebarMenuItem>
                  )}

                {dashboardData?.recent_projects?.map((project: any) => {
                  const active = pathname.includes(project.id);

                  return (
                    <SidebarMenuItem key={project.id}>
                      <HoverCard>
                        <HoverCardTrigger delay={200} closeDelay={100}>
                          <SidebarMenuButton
                            onClick={() =>
                              router.push(`/projects/${project.id}/summary`)
                            }
                            isActive={active}
                            className="cursor-pointer"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-primary ring-3 ring-primary/30" />
                            <span className="ml-1 text-sm">
                              {project.title}
                            </span>
                          </SidebarMenuButton>
                        </HoverCardTrigger>

                        <HoverCardContent
                          side="right"
                          align="center"
                          className="w-auto ring-0 p-0"
                        >
                          <ButtonGroup orientation="vertical">
                            {PROJECTS_HOVER_ITEMS.map((item) => (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  router.push(item.getHref(project.id))
                                }
                                className="cursor-pointer"
                              >
                                {item.name}
                              </Button>
                            ))}
                          </ButtonGroup>
                        </HoverCardContent>
                      </HoverCard>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="w-full">
            {isProfileLoading && <Spinner className="m-auto w-4 h-4" />}

            {profileError && !profileData && (
              <span className="block w-full text-center text-sm text-muted-foreground">
                Failed to fetch profile :(
              </span>
            )}

            {profileData && (
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full">
                  <SidebarMenuButton className="w-full h-auto flex items-center border cursor-pointer">
                    <Avatar>
                      <AvatarImage src={profileData?.profile_image_url} />
                    </Avatar>

                    <div className="w-full flex flex-col gap-0.5">
                      <span className="text-sm font-medium truncate">
                        {profileData?.name}
                      </span>

                      <span className="text-xs text-muted-foreground truncate">
                        {profileData?.email}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                  {SETTINGS_DROPDOWN_ITEMS.map((item) => (
                    <DropdownMenuItem
                      key={item.name}
                      variant="default"
                      onClick={() => router.push(item.href)}
                      className="cursor-pointer"
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm">{item.name}</span>
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    variant="destructive"
                    onClick={logOut}
                    className="cursor-pointer"
                  >
                    <LogOutIcon className="w-4 h-4" />
                    <span className="text-sm">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
