"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function AppearancePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return (
      <div className="h-[100px] w-full animate-pulse bg-muted rounded-lg" />
    );
  }

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Apply Theme</h2>
        <p className="text-base max-w-[60ch]">Select your preferred theme</p>

        <RadioGroup
          value={ThemeProvider}
          onValueChange={(val) => setTheme(val)}
          className="grid grid-cols-3 gap-2 max-w-xs"
        >
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.value;

            return (
              <div key={opt.value}>
                {/* The hidden native radio selector required for accessibility forms */}
                <RadioGroupItem
                  value={opt.value}
                  id={opt.value}
                  className="sr-only"
                />

                {/* The customized interactive container panel label */}
                <Label
                  htmlFor={opt.value}
                  className={cn(
                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover py-3 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                    isSelected
                      ? "border-primary"
                      : "border-transparent bg-muted/40",
                  )}
                >
                  <Icon className="mb-3 h-5 w-5" />
                  <span className="text-xs font-semibold">{opt.label}</span>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </div>
    </div>
  );
}
