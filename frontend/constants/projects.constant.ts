import { Member, TEAM_POOL } from "./users.constant";

export type QuickLink = {
  id: string;
  title: string;
  url: string;
  addedBy: string;
  updatedAt: string;
  action: "added" | "updated";
};

export type Project = {
  id: string;
  name: string;
  color: string; // tailwind color class fragment
  joinedDate: string;
  status: "ACTIVE" | "PLANNING" | "ARCHIVED";
  objective: string;
  method: string;
  expectedResult: string;
  members: Member[];
  quickLinks: QuickLink[];
};

export const PROJECTS: Project[] = [
  {
    id: "apollo-os",
    name: "Apollo OS",
    color: "emerald",
    joinedDate: "2024-07-12",
    status: "ACTIVE",
    objective:
      "Rebuild the internal operating system as a modular, event-driven platform that any product team can extend without waiting on a central release train.",
    method:
      "Ship a domain-oriented monorepo with independently versioned packages. Migrate the payments and identity domains first, then dogfood the new SDK for two quarters before opening it to all teams.",
    expectedResult:
      "A 40% reduction in cross-team deploy coordination time and a documented SDK adopted by at least six product areas by end of the fiscal year.",
    members: TEAM_POOL.slice(0, 6),
    quickLinks: [
      { id: "l1", title: "Architecture Docs", url: "#", addedBy: "Sarah Chen", updatedAt: "2d ago", action: "added" },
      { id: "l2", title: "Migration Schedule", url: "#", addedBy: "Marc Aurel", updatedAt: "4h ago", action: "updated" },
      { id: "l3", title: "SDK RFC — v0.3", url: "#", addedBy: "Priya Rao", updatedAt: "1w ago", action: "added" },
    ],
  },
  {
    id: "lumina-web",
    name: "Lumina Web",
    color: "amber",
    joinedDate: "2024-08-01",
    status: "PLANNING",
    objective:
      "Refresh the public marketing site to communicate the platform story clearly, with a design system that non-designers can safely extend.",
    method:
      "Content-first: rewrite core pages before any visual work, then build tokens and components in parallel. Measure with weekly usability sessions.",
    expectedResult:
      "A published site with a documented component library, and a 25% lift in trial signups within two months of launch.",
    members: TEAM_POOL.slice(1, 5),
    quickLinks: [
      { id: "l1", title: "Brand Guidelines", url: "#", addedBy: "Jonas Weber", updatedAt: "1d ago", action: "updated" },
      { id: "l2", title: "Content Doc", url: "#", addedBy: "Nora Vidal", updatedAt: "3h ago", action: "added" },
    ],
  },
  {
    id: "vector-cms",
    name: "Vector CMS",
    color: "primary",
    joinedDate: "2024-06-20",
    status: "ACTIVE",
    objective:
      "Deliver a headless CMS that editors actually enjoy using, with structured content, previews, and workflows built in.",
    method:
      "Design the editing experience before the schema layer. Prototype in production data early, then harden APIs.",
    expectedResult:
      "Editors moving off the legacy tool with fewer support tickets and faster publish cycles.",
    members: TEAM_POOL.slice(2),
    quickLinks: [
      { id: "l1", title: "Editor UX Notes", url: "#", addedBy: "Lin Zhao", updatedAt: "5h ago", action: "added" },
    ],
  },
  {
    id: "orbital-analytics",
    name: "Orbital Analytics",
    color: "violet",
    joinedDate: "2024-05-04",
    status: "ARCHIVED",
    objective: "Consolidate product analytics into a single warehouse-backed pipeline.",
    method: "Migrate off vendor SDKs to a single event schema owned by data platform.",
    expectedResult: "Unified funnel and retention reporting across all surfaces.",
    members: TEAM_POOL.slice(0, 3),
    quickLinks: [],
  },
  {
    id: "helio-mobile",
    name: "Helio Mobile",
    color: "rose",
    joinedDate: "2024-03-18",
    status: "ACTIVE",
    objective: "Ship the flagship mobile app with parity for the top ten web workflows.",
    method: "Feature flag native surfaces behind the shared design system.",
    expectedResult: "1.0 launch with a 4.6+ app store rating and sub-2s cold start on mid-tier devices.",
    members: TEAM_POOL.slice(1, 6),
    quickLinks: [],
  },
];
