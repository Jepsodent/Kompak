export const COLUMN_STYLES: Record<
  string,
  { bg: string; border: string; hover: string }
> = {
  "e152eec0-fb60-4839-ba14-427a5d503f3a": {
    bg: "bg-card",
    border: "border border-card-foreground/10",
    hover: "hover:bg-foreground/5",
  },
  "18c3c0ec-8740-42a0-bb07-aee692f70f69": {
    bg: "bg-in-progress/15",
    border: "border border-in-progress-foreground/15",
    hover: "hover:bg-in-progress-foreground/5",
  },
  "355bf6db-1a52-415d-987e-0a999482ae5f": {
    bg: "bg-in-review/15",
    border: "border border-in-review-foreground/15",
    hover: "hover:bg-in-review-foreground/5",
  },
  "e6eea38c-f626-43b6-a2d2-19e1b440b6aa": {
    bg: "bg-done/20",
    border: "border border-done-foreground/15",
    hover: "hover:bg-done-foreground/5",
  },
};
