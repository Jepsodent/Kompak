"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ShareDialog({
  open,
  onOpenChange,
  projectName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectName: string;
}) {
  const [copied, setCopied] = useState(false);
  const link = `https://kinetic.app/invite/${projectName.toLowerCase().replace(/\s+/g, "-")}?token=inv_5x9k2m`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Invite link copied");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy link");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to {projectName}</DialogTitle>
          <DialogDescription>
            Anyone with this link can request to join. Link expires in 7 days.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 min-w-0 rounded-md bg-foreground/5 px-3 py-2 text-xs font-mono truncate">
            {link}
          </div>
          <Button size="sm" onClick={copy} variant={copied ? "secondary" : "default"}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            <span className="ml-1.5">{copied ? "Copied" : "Copy"}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
