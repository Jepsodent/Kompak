"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { ProjectService } from "@/lib/api/project.api";
import { Input } from "../ui/input";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectName: string;
  projectId: string;
}

export function ShareDialog({
  open,
  onOpenChange,
  projectName,
  projectId,
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");

  const generateMutation = useMutation({
    mutationFn: () => ProjectService.generateInvitation(projectId),
    onSuccess: (link) => {
      setGeneratedLink(link);
      toast.success(generatedLink ? "Link regenerated!" : "Link generated!");
    },
    onError: () => {
      toast.error("Failed to generate link");
    },
  });

  async function copy() {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast.success("Invite link copied");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy link");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to {projectName}</DialogTitle>
          <DialogDescription>
            Generate a secure link. Anyone who click this link can join this
            project as a MEMBER.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1.5">
          <Input
            type="text"
            readOnly
            value={generatedLink}
            placeholder="Click generate to create an invite link..."
            onClick={(e) => e.currentTarget.select}
            className="flex-1 "
          />

          <Button
            size="sm"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            variant="outline"
          >
            <RefreshCw
              className={`size-4 mr-1.5 ${generateMutation.isPending ? "animate-spin" : ""}`}
            />
            {generatedLink ? "Regenerate" : "Generate"}
          </Button>
        </div>

        <DialogFooter>
          <Button
            onClick={copy}
            variant={copied ? "secondary" : "default"}
            disabled={!generatedLink || generateMutation.isPending}
            className="w-full"
          >
            {copied ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
            <span className="ml-1.5">{copied ? "Copied" : "Copy"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
