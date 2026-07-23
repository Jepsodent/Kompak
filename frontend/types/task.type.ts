export interface TaskStatus {
  id: string;
  code: string;
  name: string;
}

export interface AssigneeProfile {
  name: string;
  profile_image_url?: string | null;
}

export interface AssigneeMember {
  profile: AssigneeProfile;
}

export interface TaskAssignee {
  member: AssigneeMember;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: TaskStatus;
  assignees: TaskAssignee[];
}

export interface CreateTaskPayload {
  title: string;
  description?: string | null;
  due_date: string;
  status_id: string;
  assignee_ids?: string[] | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  due_date?: string;
  status_id?: string;
  assignee_ids?: string[] | null;
}
