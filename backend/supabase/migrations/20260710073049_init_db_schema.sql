-- ============================================
-- PROJECT
-- ============================================

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete restrict,
  title varchar not null,
  background text,
  objective text,
  method text,
  expected_result text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role varchar not null check (role in ('LEADER', 'MEMBER')),
  membership_status varchar not null default 'ACTIVE' check (membership_status in ('ACTIVE', 'LEFT', 'REMOVED')),
  joined_at timestamptz not null default now(),
  unique (project_id, profile_id)
);

create table public.quick_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  created_by_member_id uuid references public.project_members(id) on delete set null,
  title varchar not null,
  url varchar not null,
  created_at timestamptz not null default now()
);

-- ============================================
-- TASK
-- ============================================

create table public.task_statuses (
  id uuid primary key default gen_random_uuid(),
  code varchar not null unique,
  name varchar not null,
  sort_order int not null default 0
);

-- Seed default statuses (opsional, sesuaikan)
insert into public.task_statuses (code, name, sort_order) values
  ('TODO', 'To Do', 1),
  ('IN_PROGRESS', 'In Progress', 2),
  ('IN_REVIEW', 'In Review', 3),
  ('DONE', 'Done', 4);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  status_id uuid not null references public.task_statuses(id),
  created_by_member_id uuid references public.project_members(id) on delete set null,
  title varchar not null,
  description text,
  source varchar not null default 'MANUAL' check (source in ('MANUAL', 'AI')),
  due_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_assignees (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  project_member_id uuid not null references public.project_members(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unique (task_id, project_member_id)
);

-- ============================================
-- PROOF OF WORK
-- ============================================

create table public.proof_of_works (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null unique references public.tasks(id) on delete cascade,
  submitted_by_member_id uuid references public.project_members(id) on delete set null,
  summary_notes text,
  submitted_at timestamptz not null default now()
);

create table public.proof_attachments (
  id uuid primary key default gen_random_uuid(),
  proof_of_work_id uuid not null references public.proof_of_works(id) on delete cascade,
  file_name varchar not null,
  file_url varchar not null,
  mime_type varchar,
  uploaded_at timestamptz not null default now()
);

create table public.task_reviews (
  id uuid primary key default gen_random_uuid(),
  proof_of_work_id uuid not null references public.proof_of_works(id) on delete cascade,
  reviewer_member_id uuid references public.project_members(id) on delete set null,
  feedback text,
  rating int check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

-- ============================================
-- NOTIFICATION
-- ============================================

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  title varchar not null,
  message text,
  channel varchar,
  is_read boolean not null default false,
  scheduled_at timestamptz,
  sent_at timestamptz
);

-- ============================================
-- REPORT
-- ============================================

create table public.report_papers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  generated_by_member_id uuid references public.project_members(id) on delete set null,
  title varchar not null,
  background text,
  objective text,
  method text,
  result_summary text,
  created_at timestamptz not null default now()
);

create table public.report_contributions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.report_papers(id) on delete cascade,
  project_member_id uuid not null references public.project_members(id) on delete cascade,
  contribution_summary text
);

-- ============================================
-- INDEXES (buat foreign key yang sering di-query)
-- ============================================

create index idx_project_members_project_id on public.project_members(project_id);
create index idx_project_members_profile_id on public.project_members(profile_id);
create index idx_tasks_project_id on public.tasks(project_id);
create index idx_tasks_status_id on public.tasks(status_id);
create index idx_task_assignees_task_id on public.task_assignees(task_id);
create index idx_notifications_profile_id on public.notifications(profile_id);