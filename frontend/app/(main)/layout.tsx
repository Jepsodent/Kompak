import { AppSidebar } from "@/components/common/app-sidebar";
import { TopHeader } from "@/components/common/top-header";
import { Toaster } from "@/components/ui/sonner";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar nongkrong di kiri */}
      <AppSidebar />
      
      {/* Wrapper konten utama di kanan */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <TopHeader />
        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>
      </div>
      
      <Toaster />
    </div>
  );
}