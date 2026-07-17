export type DashboardRecentProject = {
  id: string;
  title: string;
  joined_at: string;
  member_profile_image: string[];
};

export  type DueSoonTask = {
  id: string;
  title: string;
  due_date: string;
  project_title?: string;
};

export type DashboardData = {
  total_projects: number;
  my_total_tasks: number;
  tasks_due_soon: DueSoonTask[];
  recent_projects: DashboardRecentProject[];
};