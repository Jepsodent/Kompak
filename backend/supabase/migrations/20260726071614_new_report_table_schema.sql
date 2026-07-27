DROP TABLE IF EXISTS public.report_contributions;
DROP TABLE IF EXISTS public.report_papers;

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_by_member_id uuid REFERENCES public.project_members(id) ON DELETE SET NULL,
  title varchar NOT NULL,
  type varchar NOT NULL DEFAULT 'CONTRIBUTION', -- 'CONTRIBUTION' / 'AI_SUMMARY'
  content_json jsonb NOT NULL, -- Menyimpan data matriks kontribusi (JSON)
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_project_id ON public.reports(project_id)