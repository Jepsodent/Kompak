"use client";

import NotificationCard from "@/components/notifications/notification_card";
import GenerateTaskDialog from "@/components/tasks/generate-task.dialog";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useGetNotifications } from "@/hooks/useNotification";
import { Bell, HeartCrack } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotificationPage() {
  const router = useRouter();
  const {
    data: notifications,
    isLoading: isNotificationsLoading,
    error: notificationsError,
  } = useGetNotifications();

  if (isNotificationsLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center gap-2">
        <Spinner className="w-4 h-4" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (notificationsError && !notifications) {
    return (
      <div className="w-full h-full flex justify-center items-center gap-2">
        <HeartCrack className="w-4 h-4" />
        <span className="text-sm text-muted-foreground">
          Error fetching notifications
        </span>
      </div>
    );
  }

  if (notifications?.all.length === 0) {
    return (
      <Empty className="w-full h-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Bell />
          </EmptyMedia>

          <EmptyTitle>No Notifications</EmptyTitle>
          <EmptyDescription className="max-w-xs">
            You&apos;re all caught up. New notifications will appear here.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.refresh()}
            className="cursor-pointer"
          >
            Refresh
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  const seenNotifications = notifications?.seen ?? [];
  const unseenNotifications = notifications?.unseen ?? [];

  return (
    <div className="p-8 w-full flex flex-col">
      {/* NOTIFICATION LIST */}
      <div className="flex flex-col gap-3">
        {unseenNotifications.map((item) => (
          <NotificationCard
            key={item.id}
            notification={item}
            notificationCardStyle={"unseen"}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center">
        <span className="block text-sm font-medium">Seen</span>
      </div>

      <div className="mt-2 flex flex-col gap-3">
        {seenNotifications.map((item) => (
          <NotificationCard
            key={item.id}
            notification={item}
            notificationCardStyle={"seen"}
          />
        ))}
      </div>
    </div>
  );
}
