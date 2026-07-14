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
    <div className="w-full max-w-sm mb-auto ml-auto mr-auto mt-[16vh] flex flex-col gap-4">
      {/* AuthNavbar*/}
      <div className="flex gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-card ring-1 ring-foreground/10 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
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
