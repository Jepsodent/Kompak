import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusType = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "DUE_SOON";

export function StatusBadge({ status, className }: { status: StatusType; className?: string }) {
  const getVariant = () => {
    switch (status) {
      case "DONE":
        return "bg-success/15 text-success border-success/30 hover:bg-success/25";
      case "IN_PROGRESS":
        return "bg-primary/15 text-primary border-primary/30 hover:bg-primary/25";
      case "IN_REVIEW":
        return "bg-sky-500/15 text-sky-400 border-sky-500/30 hover:bg-sky-500/25";
      case "DUE_SOON":
        return "bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/25";
      case "TODO":
      default:
        return "bg-muted text-muted-foreground border-border hover:bg-muted/80";
    }
  };

  const getLabel = () => {
    switch (status) {
      case "IN_PROGRESS": return "IN PROGRESS";
      case "IN_REVIEW": return "REVIEW";
      case "DUE_SOON": return "DUE SOON";
      case "TODO": return "TODO";
      case "DONE": return "DONE";
      default: return status;
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", getVariant(), className)}
    >
      {getLabel()}
    </Badge>
  );
}
