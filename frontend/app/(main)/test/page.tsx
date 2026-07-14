"use client"
import { DataTable, type ColumnDef } from "@/components/common/data-table";
import { StatusBadge, type StatusType } from "@/components/common/status-badge";

type TaskMock = {
  id: string;
  title: string;
  status: StatusType;
  dueDate: string;
};

const mockData: TaskMock[] = [
  { id: "TASK-01", title: "Setup Frontend Repo", status: "DONE", dueDate: "2026-07-10" },
  { id: "TASK-02", title: "Integrasi Supabase", status: "IN_REVIEW", dueDate: "2026-07-12" },
  { id: "TASK-03", title: "Bikin Reusable Table", status: "IN_PROGRESS", dueDate: "2026-07-15" },
  { id: "TASK-04", title: "Deploy ke Vercel", status: "TODO", dueDate: "2026-07-20" },
  { id: "TASK-05", title: "Fix bug layout gawat", status: "DUE_SOON", dueDate: "2026-07-14" },
];

const columns: ColumnDef<TaskMock>[] = [
  { 
    header: "Task ID", 
    accessorKey: "id", 
    className: "w-28 text-muted-foreground font-medium" 
  },
  { 
    header: "Task Name", 
    accessorKey: "title", 
    className: "font-semibold text-foreground" 
  },
  { 
    header: "Status", 
    cell: (item) => <StatusBadge status={item.status} /> 
  },
  { 
    header: "Due Date", 
    accessorKey: "dueDate", 
    className: "text-right text-muted-foreground" 
  },
];

export default function TestPage() {
  return (
    <div className="p-10 max-w-5xl mx-auto min-h-screen bg-background">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Uji Coba Reusable DataTable</h1>
        <p className="text-muted-foreground mt-2">Tema sudah diganti ke Dark Mode ala Lovable (Charcoal & Apricot).</p>
      </div>
      
      <DataTable columns={columns} data={mockData} />
    </div>
  );
}
