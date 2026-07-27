import { GetNotificationPayload } from "@/types/notification.type";
import { axiosClient } from "../axios";
import { NestResponse } from "@/types/api.type";

export const NotificationService = {
  getNotifications: async (): Promise<GetNotificationPayload[]> => {
    const response =
      await axiosClient.get<NestResponse<GetNotificationPayload[]>>(
        `/notifications`,
      );

    return response.data.data;
  },

  markAsRead: async (
    notificationId: string,
  ): Promise<GetNotificationPayload> => {
    const response = await axiosClient.patch<
      NestResponse<GetNotificationPayload>
    >(`/notifications/${notificationId}`);

    return response.data.data;
  },
};
