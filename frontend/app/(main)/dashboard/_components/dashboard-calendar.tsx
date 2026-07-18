"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TASKS } from "@/constants/tasks.constant";

function isoFromParts(y: number, m: number, d: number) {
  return new Date(Date.UTC(y, m, d)).toISOString().slice(0, 10);
}

const weekdays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function DashboardCalendar({
  selectedDate,
  onSelect,
}: {
  selectedDate: string;
  onSelect: (iso: string) => void;
}) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date(selectedDate);
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
  });

  const monthLabel = new Date(Date.UTC(cursor.year, cursor.month, 1)).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );

  const dueDates = useMemo(() => {
    const set = new Set<string>();
    for (const t of TASKS) if (t.status !== "DONE") set.add(t.dueDate);
    return set;
  }, []);

  const cells = useMemo(() => {
    const first = new Date(Date.UTC(cursor.year, cursor.month, 1));
    const dayOfWeek = (first.getUTCDay() + 6) % 7; // Mon = 0
    const daysInMonth = new Date(Date.UTC(cursor.year, cursor.month + 1, 0)).getUTCDate();
    const daysInPrev = new Date(Date.UTC(cursor.year, cursor.month, 0)).getUTCDate();
    const cells: { iso: string; day: number; inMonth: boolean }[] = [];
    for (let i = dayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrev - i;
      const d = new Date(Date.UTC(cursor.year, cursor.month - 1, day));
      cells.push({
        iso: d.toISOString().slice(0, 10),
        day,
        inMonth: false,
      });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ iso: isoFromParts(cursor.year, cursor.month, day), day, inMonth: true });
    }
    while (cells.length % 7 !== 0 || cells.length < 35) {
      const idx = cells.length - dayOfWeek - daysInMonth + 1;
      const d = new Date(Date.UTC(cursor.year, cursor.month + 1, idx));
      cells.push({
        iso: d.toISOString().slice(0, 10),
        day: d.getUTCDate(),
        inMonth: false,
      });
      if (cells.length >= 42) break;
    }
    return cells;
  }, [cursor]);

  function shift(delta: number) {
    setCursor((c) => {
      const d = new Date(Date.UTC(c.year, c.month + delta, 1));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    });
  }

  return (
    <div className="bg-card p-6 rounded-2xl ring-1 ring-white/10 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h4 className="font-semibold font-display text-base tracking-tight">{monthLabel}</h4>
        <div className="flex gap-1.5">
          <button
            onClick={() => shift(-1)}
            className="size-7 flex items-center justify-center border border-border rounded-md hover:bg-background transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            onClick={() => shift(1)}
            className="size-7 flex items-center justify-center border border-border rounded-md hover:bg-background transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border border border-border rounded-lg overflow-hidden text-[11px]">
        {weekdays.map((w) => (
          <div key={w} className="bg-background p-2 text-center text-muted-foreground font-medium">
            {w}
          </div>
        ))}
        {cells.map((c) => {
          const hasDue = dueDates.has(c.iso);
          const selected = c.iso === selectedDate;
          return (
            <button
              key={c.iso + c.day}
              onClick={() => onSelect(c.iso)}
              className={`bg-card h-16 md:h-20 p-2 text-left relative transition-colors ${
                c.inMonth ? "text-foreground" : "text-muted-foreground/40"
              } ${selected ? "bg-primary/5 ring-2 ring-primary z-10" : "hover:bg-primary/5"}`}
            >
              <span
                className={`text-[11px] font-medium ${
                  selected ? "text-primary" : ""
                }`}
              >
                {c.day}
              </span>
              {hasDue && (
                <span className="absolute bottom-2 left-2 right-2 h-1 rounded-full bg-primary/70" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
