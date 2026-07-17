export type Role = "MEMBER" | "LEADER";

export type Member = {
  id: string;
  name: string;
  initials: string;
  role: Role;
  color: string;
};

export const CURRENT_USER: Member = {
  id: "u-me",
  name: "Sarah Chen",
  initials: "SC",
  role: "LEADER",
  color: "bg-primary/15 text-primary",
};

export const TEAM_POOL: Member[] = [
  CURRENT_USER,
  { id: "u-2", name: "Marc Aurel", initials: "MA", role: "MEMBER", color: "bg-emerald-500/100/15 text-emerald-300" },
  { id: "u-3", name: "Priya Rao", initials: "PR", role: "MEMBER", color: "bg-amber-500/100/15 text-amber-300" },
  { id: "u-4", name: "Jonas Weber", initials: "JW", role: "LEADER", color: "bg-rose-500/15 text-rose-300" },
  { id: "u-5", name: "Lin Zhao", initials: "LZ", role: "MEMBER", color: "bg-violet-500/15 text-violet-300" },
  { id: "u-6", name: "Ade Adeyemi", initials: "AA", role: "MEMBER", color: "bg-sky-500/15 text-sky-300" },
  { id: "u-7", name: "Nora Vidal", initials: "NV", role: "MEMBER", color: "bg-teal-500/15 text-teal-300" },
];
