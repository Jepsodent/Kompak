export interface TaskAssigneeWithDetails {
  task_id: string;
  tasks: {
    id: string;
    title: string;
    due_date: string | null;
    project_id: string;
    task_statuses: { code: string } | null;
    projects: { title: string } | null;
  } | null;
}

export interface RecentProjectRow {
  joined_at: string;
  projects: { id: string; title: string } | null;
}

export interface DueSoonTask {
  id: string;
  title: string;
  due_date: string;
  project_title: string | undefined;
}