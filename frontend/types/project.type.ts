export type ProjectRole = "LEADER" | "MEMBER";

export interface Project {
  data: {
    id: string;
    title: string;
    background?: string | null;
    objective?: string | null;
    method?: string | null;
    expected_result?: string | null;
    created_at: string;
    updated_at: string;
  }
}

export interface ProjectMember {
  id: string;
  project_id: string;
  profile_id: string;
  role: ProjectRole;
  membership_status: string;
  profiles: {
    name: string;
    email: string;
    profile_image_url: string;
  };
}