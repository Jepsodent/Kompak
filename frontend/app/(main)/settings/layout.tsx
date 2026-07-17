"use client";

import { logOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { LogOut, Palette, Settings, UserPen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppNavbarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { name: "Profile", href: ROUTES.settings.profile, icon: UserPen },
    { name: "Account", href: ROUTES.settings.account, icon: Settings },
    { name: "Appearance", href: ROUTES.settings.appearance, icon: Palette },
  ];

  const pathname = usePathname();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-4">
      <div className="flex flex-col gap-2 pb-4">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-base text-muted-foreground">
          Manage your profile details, account setings, and appearance
          preferences
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        <nav className="flex md:flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-md transition-all duration-200 md:w-60",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-background text-secondary-foreground border hover:bg-primary hover:text-primary-foreground",
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <form action={logOut}>
            <Button
              type="submit"
              variant="destructive"
              className={cn(
                "flex justify-start items-center gap-2 px-6 py-2 transition-all duration-200  md:w-60 h-auto text-base font-semibold cursor-pointer",
              )}
            >
              <LogOut />
              <span>Logout</span>
            </Button>
          </form>
        </nav>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
