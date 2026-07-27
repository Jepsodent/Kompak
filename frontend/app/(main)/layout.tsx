"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import MainSidebar from "@/components/common/main-sidebar";
import MainTopbar from "@/components/common/main-topbar";

type MainLayoutProps = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <MainSidebar />

      <div className="w-full h-full border-b border-accent-foreground flex flex-col">
        <MainTopbar />

        {children}
      </div>
    </SidebarProvider>
  );
}
