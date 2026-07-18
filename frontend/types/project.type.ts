export type ProjectRole = "LEADER" | "MEMBER";

export interface Project {
    id: string;
    title: string;
    background?: string | null;
    objective?: string | null;
    method?: string | null;
    expected_result?: string | null;
    created_at: string;
    updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  profile_id: string;
  role: ProjectRole;
  membership_status: string;
  joined_at:string;
  profiles: {
    name: string;
    email: string;
    profile_image_url: string;
  };
}

export interface TaskDistribution {
  TODO: number;
  IN_PROGRESS: number;
  IN_REVIEW: number;
  DONE: number;
}


export interface DashboardStats {
  total_tasks: number;
  completion_rate: number;
  task_distribution: TaskDistribution;
}
export interface QuickLink {
    id: string;
    project_id: string;
    title: string;
    url: string;
    created_at: string;
    created_by_member_id: string;
    updated_at: string | null;
    updated_by_member_id: string | null;
    
    creator?: {
        profiles: {
            name: string;
            profile_image_url?: string | null;
        };
    } | null;
    updater?: {
        profiles: {
            name: string;
            profile_image_url?: string | null;
        };
    } | null;
}

// Boleh tambahin ini juga buat respon dashboard utuh
export interface ProjectDashboardResponse {
  stats: DashboardStats;
  tasks: TaskWithStatus[]; 
  quick_links: QuickLink[]; 
  members: ProjectMember[];
}

// ini hrs task type.ts
export interface TaskWithStatus {
    id: string;
    title:string;
    due_date:string | null;
    task_statuses: {
        code: string;
    } | null
}