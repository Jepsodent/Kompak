import { TaskService } from "@/lib/api/task.api";
import { CreateTaskPayload, UpdateTaskPayload } from "@/types/task.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => TaskService.getTasks(projectId),
    staleTime: 5 * 60 * 1000,
    enabled: !!projectId, // Only fetch when projectId is available
  });
}

export function useTaskDetail(projectId: string, taskId?: string) {
  return useQuery({
    queryKey: ["task", projectId, taskId],
    queryFn: () => TaskService.getTaskById(projectId, taskId!),
    enabled: !!projectId && !!taskId,
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) =>
      TaskService.createTask(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: string;
      payload: UpdateTaskPayload;
    }) => TaskService.updateTask(projectId, taskId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => TaskService.deleteTask(projectId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}
