import { ProjectService } from "@/lib/services/project.service";
import { Project, ProjectMember } from "@/types/project.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";


export function useProjectDetails(projectId:string){
    const  queryClient = useQueryClient()
    
    const projectQuery  = useQuery({
        queryKey: ["project", projectId],
        queryFn: () => ProjectService.getById(projectId),
        enabled: !!projectId,
    })

    const memberQuery = useQuery({
        queryKey: ["project-members", projectId],
        queryFn: () => ProjectService.getProjectMembers(projectId),
        enabled: !!projectId,
    })

    const dashboardQuery = useQuery({
        queryKey: ['project-dashboard', projectId],
        queryFn: () => ProjectService.getProjectDashboard(projectId),
        enabled: !!projectId,
    })

    const updateMutation = useMutation({
        mutationFn:(variables: { title?: string; background?:string; objective?: string; method?: string; expected_result?: string }) => ProjectService.updateProject(projectId, variables),
        onSuccess: (updatedData) => {
            queryClient.setQueryData(['project',projectId], updatedData);
            queryClient.invalidateQueries({queryKey: ["dashboard"]});
            toast.success('Project saved')
        },
        onError: (error: AxiosError) => {
            const serverMessage = error.response?.data.message;
            const description = Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage || error.message
            toast.error("Failed to update project", {description})
        }
    })

    return {
        project: projectQuery.data,
        members :memberQuery.data || [],
        dashboard: dashboardQuery.data, 
        isLoading: projectQuery.isLoading || memberQuery.isLoading || dashboardQuery.isLoading,
        isError : projectQuery.isError,
        updateProject: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
    }



}