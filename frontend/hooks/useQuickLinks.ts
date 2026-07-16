import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LinkService } from "@/lib/api/quick-link.api";
import { toast } from "sonner";

export function useQuickLinks(projectId: string) {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (vars: { title: string; url: string }) => LinkService.addQuicklink(projectId, vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-dashboard", projectId] });
      toast.success("Link added");
    },
  });

  const editMutation = useMutation({
    mutationFn: (vars: {id:string; title: string; url: string }) => LinkService.editQuicklink(projectId,vars.id, vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-dashboard", projectId] });
      toast.success("Link updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => LinkService.removeQuicklink(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-dashboard", projectId] });
      toast.success("Link removed");
    },
  });

  return {
    addLink: addMutation.mutateAsync, // Pake mutateAsync biar modal bisa nungguin loadingnya
    editLink: editMutation.mutateAsync,
    deleteLink: deleteMutation.mutate,
    isPending: addMutation.isPending || editMutation.isPending || deleteMutation.isPending,
  };
}