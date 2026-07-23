import { ProjectService } from "@/lib/api/project.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";



export function useMember(projectId:string){
    const queryClient = useQueryClient()
    
    const roleMutation = useMutation({
        mutationFn: (vars: {memberId:string, role: "LEADER" | "MEMBER"}) => ProjectService.updateMemberRole(projectId, vars.memberId, vars.role),
        onSuccess: () => {
            // harusnya bukan project-dashboard tapi project-members
            // queryClient.invalidateQueries({queryKey: ["project-dashboard", projectId]})
            queryClient.invalidateQueries({queryKey: ["project-members", projectId]})
            toast.success('Role updated')
        },
        onError: (err:any) => {
            toast.error('Failed to update role', {description: err?.response?.data?.message || err.message})
        }
    })
    
    
    const kickMutation = useMutation({
        mutationFn: (memberId: string) => ProjectService.kickMember(projectId, memberId),
        onSuccess: () => {
            // queryClient.invalidateQueries({ queryKey: ["project-dashboard", projectId] });
            queryClient.invalidateQueries({queryKey: ["project-members", projectId]})
        toast.success("Member removed");
        },
        onError: (err: any) => toast.error("Failed to remove member", { description: err?.response?.data?.message || err.message })
  });

  return {
    updateRole: roleMutation.mutate,
    kickMember: kickMutation.mutate
  }

}