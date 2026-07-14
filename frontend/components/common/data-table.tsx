"use client";

import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  header: string | ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({ 
  columns, 
  data, 
  emptyMessage = "Belum ada data.",
  className
}: DataTableProps<T>) {
  return (
    <div className={cn("rounded-xl border border-border bg-card shadow-sm overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border/50">
            {columns.map((col, i) => (
              <TableHead 
                key={i} 
                className={cn(
                  "h-14 px-6 align-middle text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                  col.className
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data && data.length > 0 ? (
            data.map((row, rowIndex) => (
              <TableRow 
                key={rowIndex} 
                className="transition-colors hover:bg-muted/30 border-b border-border/50 last:border-0"
              >
                {columns.map((col, colIndex) => (
                  <TableCell 
                    key={colIndex} 
                    className={cn("px-6 py-4 align-middle text-sm text-card-foreground", col.className)}
                  >
                    {col.cell 
                      ? col.cell(row) 
                      : col.accessorKey 
                        ? String(row[col.accessorKey]) 
                        : null}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
