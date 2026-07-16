"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectService } from "@/lib/api/project.api";

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
}

export function DeleteProjectDialog({ open, onOpenChange, projectId, projectTitle }: DeleteProjectDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => ProjectService.deleteProject(projectId),
    onSuccess: () => {
      toast.success("Project deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }); // Biar sidebar ke-refresh
      onOpenChange(false);
      router.push("/dashboard"); // Tendang user balik ke home/dashboard
    },
    onError: (err:any) => {
      toast.error("Failed to delete project", { 
        description: err?.response?.data?.message || err.message 
      });
    }
  });

  // Tombol cuma aktif kalau teks yang diketik PERSIS SAMA dengan judul proyek
  const isMatch = confirmText === projectTitle;

  function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    if (!isMatch) return;
    deleteMutation.mutate();
  }

  // Biar tiap kali modal ditutup, teksnya kereset
  const handleOpenChange = (val: boolean) => {
    if (!val) setConfirmText("");
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md border-destructive/20">
        <form onSubmit={handleDelete}>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Project</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the 
              <span className="font-semibold text-foreground mx-1">{projectTitle}</span> 
              project, including all tasks, links, and members.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="confirm-text">
                Please type <span className="font-bold select-none">{projectTitle}</span> to confirm.
              </Label>
              <Input
                id="confirm-text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={projectTitle}
                disabled={deleteMutation.isPending}
                className={confirmText && !isMatch ? "border-destructive focus-visible:ring-destructive" : ""}
                autoComplete="off"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="destructive" 
              disabled={!isMatch || deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "I understand, delete this project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}