import { NotificationService } from "@/lib/api/notifications.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => NotificationService.getNotifications(),
    staleTime: 5 * 60 * 1000,

    select: (data) => {
      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      return {
        all: sorted,
        seen: sorted.filter((n) => n.is_read),
        unseen: sorted.filter((n) => !n.is_read),
      };
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      NotificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
