import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const PROJECT_COLORS = [
  "emerald",
  "amber",
  "primary",
  "violet",
  "rose",
  "blue",
  "cyan",
  "pink",
];

export function getProjectColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PROJECT_COLORS.length;
  return PROJECT_COLORS[index];
}

export function getInitials(name:string):string {
  if (!name) return "";
  const parts = name.trim().split(' ')
  if(parts.length === 1){
    return parts[0].substring(0,2).toUpperCase()
  }
  return (parts[0][0] + parts[1][0]).toUpperCase()
}