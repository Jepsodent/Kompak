export type GetNotificationPayload = {
  id: string;
  profile_id: string;
  task_id: string;
  title: string;
  message: string;
  channel: NotificationChannel;
  is_read: boolean;
  scheduled_at: string | null;
  created_at: string;
  tasks: {
    project_id: string;
  };
};

export type NotificationChannel = "IN_APP" | "EMAIL";
