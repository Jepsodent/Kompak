"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthNavbarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Quick Login", href: "/auth/quick-login" },
    { name: "Login", href: "/auth/login" },
    { name: "Register", href: "/auth/register" },
  ];

  return (
    <div className="flex flex-col items-center gap-6 bg-background text-foreground mt-[10vh]">
      {/* AuthNavbar*/}
      <div className="flex gap-1.5 rounded-xl border border-border bg-card p-1.5 shadow-md">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-5 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? // Active State: maps directly to your secondary/accent backgrounds
                    "bg-accent text-accent-foreground border border-border shadow-sm"
                  : // Inactive States: maps cleanly to muted themes
                    "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Content Card*/}
      <main className="w-full max-w-md animate-in fade-in-50 duration-300">
        {children}
      </main>
    </div>
  );
}
