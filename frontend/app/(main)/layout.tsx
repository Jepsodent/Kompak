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
      <div className="flex w-full min-h-screen">
        <MainSidebar />

        <div className="min-w-0 flex flex-1 flex-col">
          <MainTopbar />

          <div className="flex-1 w-full">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
