"use client";

import NotificationCard from "@/components/notifications/notification_card";
import GenerateTaskDialog from "@/components/tasks/generate-task.dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Notification } from "@/types/notification.type";
import { useState } from "react";

const NOTIFICATIONS: Notification[] = [
  {
    id: "a9eb0bb7-49c0-4453-87c0-d96802ba3b7b",
    profile_id: "02d46119-da27-42c3-ae55-ae40935aba2a",
    task_id: "b4de8eb4-708e-48b2-a104-64cc2b62e092",
    title: "Task Approved!",
    message:
      "Your proof of work for task Workflow\n has been approved by the leader and moved to DONE.",
    channel: "IN_APP",
    is_read: false,
    scheduled_at: null,
    created_at: "2026-07-25T07:43:08.600804+00:00",
    tasks: {
      project_id: "01e1f0ce-487b-44cf-aca2-8553b7f713aa",
    },
  },
  {
    id: "a9eb0bb7-49c0-4453-87c0-d96802ba3b7basd",
    profile_id: "02d46119-da27-42c3-ae55-ae40935aba2a",
    task_id: "b4de8eb4-708e-48b2-a104-64cc2b62e092",
    title: "Task Has been Created",
    message:
      "Your proof of work for task Workflow\n has been approved by the leader and moved to DONE.",
    channel: "IN_APP",
    is_read: false,
    scheduled_at: null,
    created_at: "2026-07-25T07:43:08.600804+00:00",
    tasks: {
      project_id: "01e1f0ce-487b-44cf-aca2-8553b7f713aa",
    },
  },
  {
    id: "a9eb0bb7-49c0-4453-87c0-d96802ba3b7basd",
    profile_id: "02d46119-da27-42c3-ae55-ae40935aba2a",
    task_id: "b4de8eb4-708e-48b2-a104-64cc2b62e092",
    title: "This task is seen!",
    message:
      "Your proof of work for task Workflow\n has been approved by the leader and moved to DONE.",
    channel: "IN_APP",
    is_read: true,
    scheduled_at: null,
    created_at: "2026-07-25T07:43:08.600804+00:00",
    tasks: {
      project_id: "01e1f0ce-487b-44cf-aca2-8553b7f713aa",
    },
  },
];

export default function NotificationPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>(NOTIFICATIONS);

  const sortedNotifications = notifications.sort(
    (prevItem, nextItem) =>
      new Date(nextItem.created_at).getTime() -
      new Date(prevItem.created_at).getTime(),
  );
  const seenNotifications = sortedNotifications.filter(
    (notification) => notification.is_read == true,
  );
  const unseenNotifications = sortedNotifications.filter(
    (notification) => notification.is_read == false,
  );

  //   Reminder: Don't forgot to add conditional rendering when task is loading or failed to fetch

  // TASK SHEET LOGIC (JUST FOR TESTING)
  const [isGenerateTaskDialogOpen, setIsGenerateTaskDialogOpen] =
    useState(false);

  return (
    <div className="w-full p-8 flex flex-col">
      <h2 className="text-2xl font-bold">Notifications</h2>

      {/* NOTIFICATION LIST */}
      <div className="mt-4 flex flex-col gap-3">
        {unseenNotifications.map((item) => (
          <NotificationCard
            key={item.id}
            notification={item}
            notificationCardStyle={"unseen"}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center">
        <span className="text-sm font-medium">Seen</span>
        <Separator className="flex-1" />
        {/* Shadcn/ui's Separator component doesn't work. It would be awesome if someone/you can fix it! */}
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

      <Button
        type="button"
        variant="default"
        onClick={() => setIsGenerateTaskDialogOpen(true)}
        className="cursor-pointer"
      >
        Generate Task
      </Button>

      <GenerateTaskDialog
        open={isGenerateTaskDialogOpen}
        onOpenChange={setIsGenerateTaskDialogOpen}
      />
    </div>
  );
}
