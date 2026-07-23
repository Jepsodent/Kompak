import { PROJECTS } from "./projects.constant";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string;
  dueDate: string; // ISO date
  projectId: string;
};

const titlesByProject: Record<string, string[]> = {
  "apollo-os": [
    "Refactor Auth Context",
    "Extract billing domain package",
    "Write SDK migration guide",
    "Design plugin manifest v2",
    "Audit event-bus contracts",
    "Ship identity domain rewrite",
    "Draft deprecation policy",
    "Migrate legacy jobs runner",
  ],
  "lumina-web": [
    "Update Brand Guidelines",
    "Rewrite pricing page",
    "Design homepage hero variants",
    "Set up preview deployments",
    "Content audit — product pages",
    "New illustration set",
  ],
  "vector-cms": [
    "Prototype editor sidebar",
    "Schema validation layer",
    "Preview URL signing",
    "Workflow states UI",
    "Localization plumbing",
  ],
  "helio-mobile": [
    "Fix onboarding drop-off",
    "Native push notifications",
    "Offline reader mode",
    "App store screenshots",
  ],
  "orbital-analytics": ["Archive vendor SDKs", "Final data reconciliation"],
};

const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];
const priorities: Priority[] = ["LOW", "MEDIUM", "HIGH"];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Generate tasks mock based on projects
export const TASKS: Task[] = PROJECTS.flatMap((p) => {
  const titles = titlesByProject[p.id] ?? [];
  return titles.map((title, i) => {
    const h = hash(p.id + title);
    const day = 2 + (h % 24); // days in current month
    const month = 7; // August (0-indexed month = 7)
    const year = 2024;
    const dueDate = new Date(Date.UTC(year, month, day))
      .toISOString()
      .slice(0, 10);
    return {
      id: `${p.id}-t${i}`,
      title,
      status: statuses[h % statuses.length],
      priority: priorities[(h >> 3) % priorities.length],
      assigneeId: p.members[h % p.members.length].id,
      dueDate,
      projectId: p.id,
    };
  });
});

export const TASK_STATUSES = [
  { id: "e152eec0-fb60-4839-ba14-427a5d503f3a", name: "To Do" },
  { id: "18c3c0ec-8740-42a0-bb07-aee692f70f69", name: "In Progress" },
  { id: "355bf6db-1a52-415d-987e-0a999482ae5f", name: "In Review" },
  { id: "e6eea38c-f626-43b6-a2d2-19e1b440b6aa", name: "Done" },
];
