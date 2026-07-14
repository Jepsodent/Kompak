"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateProjectDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [objective, setObjective] = useState("");
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    
    // Simulate project creation
    toast.success("Project created", { description: name.trim() });
    
    // Nanti diganti pakai mutation / Zustand
    const newProjectId = "new-project-id"; 
    
    setName("");
    setObjective("");
    onOpenChange(false);
    router.push(`/projects/${newProjectId}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle className="text-xl">Create a project</DialogTitle>
            <DialogDescription>
              Give it a name and a one-line objective. You can invite people later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project name</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apollo OS"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-objective">Objective (optional)</Label>
              <Textarea
                id="project-objective"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="What outcome does this project unlock?"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
