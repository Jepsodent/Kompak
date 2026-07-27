import { ContributionService } from "@/lib/api/contribution.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useContributions(projectId: string) {
  return useQuery({
    queryKey: ["contributions", projectId],
    queryFn: () => ContributionService.getContributions(projectId),
    staleTime: 5 * 60 * 1000,
    enabled: !!projectId,
  });
}

export function useContributionById(projectId: string, reportId: string) {
  return useQuery({
    queryKey: ["contributions", projectId, reportId],
    queryFn: () => ContributionService.getContributionById(projectId, reportId),
    staleTime: 5 * 60 * 1000,
    enabled: !!projectId && !!reportId,
  });
}

export function useCreateContribution(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ContributionService.createContributionReport(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contributions", projectId],
      });
    },
  });
}
