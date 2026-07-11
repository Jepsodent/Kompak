"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Palette, Settings, UserPen } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const navItems = [
  {
    name: "Overview",
    href: ROUTES.app.overview,
  },
  {
    name: "Projects",
    href: ROUTES.app.projects,
  },
];

const dropdownmenuItems = [
  {
    name: "Profile",
    href: ROUTES.settings.profile,
    icon: UserPen,
  },
  {
    name: "Account",
    href: ROUTES.settings.account,
    icon: Settings,
  },
  {
    name: "Appearance",
    href: ROUTES.settings.appearance,
    icon: Palette,
  },
];

export default function AppNavbarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen w-full">
      <header className="flex h-16 items-center justify-between border-b px-4 shadow-sm">
        {/* Navigation */}
        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
