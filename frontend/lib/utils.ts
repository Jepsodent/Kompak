import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const COLOR: Record<string, string> = {
  emerald: "bg-emerald-500 ring-emerald-500/15",
  amber: "bg-amber-500 ring-amber-500/15",
  primary: "bg-primary ring-primary/15",
  violet: "bg-violet-500 ring-violet-500/15",
  rose: "bg-rose-500 ring-rose-500/15",
  blue: "bg-blue-500 ring-blue-500/15",
  cyan: "bg-cyan-500 ring-cyan-500/15",
  pink: "bg-pink-500 ring-pink-500/15",
};

export function getColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 8;
  const colors = ["emerald", "amber", "primary", "violet", "rose", "blue", "cyan", "pink"];
  
  const colorName = colors[index];   
  return COLOR[colorName] || COLOR.primary; 
}


export function getInitials(name:string):string {
  if (!name) return "";
  const parts = name.trim().split(' ')
  if(parts.length === 1){
    return parts[0].substring(0,2).toUpperCase()
  }
  return (parts[0][0] + parts[1][0]).toUpperCase()
}