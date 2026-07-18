"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { ProjectService } from "@/lib/api/project.api";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectName: string;
  projectId: string; 
}

export function ShareDialog({ open, onOpenChange, projectName, projectId }: ShareDialogProps) {
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
    }
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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Invite to {projectName}</DialogTitle>
          <DialogDescription>
            Generate a secure link. Anyone with this link can join this project as a MEMBER.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 flex items-center gap-2">
          {/* Pake input readonly biar bisa di-scroll + auto select text */}
          <input 
            type="text"
            readOnly
            value={generatedLink}
            placeholder="Click generate to create an invite link..."
            className="flex-1 rounded-md border border-input bg-foreground/5 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary whitespace-nowrap overflow-x-auto cursor-text"
            onClick={(e) => e.currentTarget.select()} // Biar pas diklik lsg ngeblok semua teks
          />
          
          <Button 
            size="sm" 
            onClick={() => generateMutation.mutate()} 
            disabled={generateMutation.isPending}
            variant="outline"
          >
            <RefreshCw className={`size-4 mr-1.5 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
            {generatedLink ? "Regenerate" : "Generate"}
          </Button>

          <Button 
            size="sm" 
            onClick={copy} 
            variant={copied ? "secondary" : "default"} 
            disabled={!generatedLink || generateMutation.isPending}
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            <span className="ml-1.5">{copied ? "Copied" : "Copy"}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}