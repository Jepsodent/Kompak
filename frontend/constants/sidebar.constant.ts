import { LayoutDashboard, Bell, type LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export const MAIN_NAV: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
  },
];