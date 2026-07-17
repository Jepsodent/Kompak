alter table public.quick_links
add column updated_at timestamptz,
add column updated_by_member_id uuid references public.project_members(id) on delete set null;