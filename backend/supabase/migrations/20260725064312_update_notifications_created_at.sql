ALTER TABLE public.notifications RENAME COLUMN sent_at TO created_at;

ALTER TABLE public.notifications ALTER COLUMN created_at SET DEFAULT now();