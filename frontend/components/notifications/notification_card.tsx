"use client";

import { GetNotificationPayload } from "@/types/notification.type";
import { Card, CardContent } from "../ui/card";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowUpRight, Info, MailOpen } from "lucide-react";
import { ButtonGroup } from "../ui/button-group";
import { Button } from "../ui/button";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";

const NOTIFICATION_CARD_STYLES: Record<
  string,
  { card: string; title: string; message: string }
> = {
  unseen: {
    card: "border-l-4 border-l-primary",
    title: "",
    message: "",
  },
  seen: {
    card: "border-l-4 border-l-transparent",
    title: "text-muted-foreground",
    message: "text-muted-foreground",
  },
};

type NotificationCardProps = {
  notification: GetNotificationPayload;
  notificationCardStyle: "seen" | "unseen";
};

export default function NotificationCard({
  notification,
  notificationCardStyle,
}: NotificationCardProps) {
  const router = useRouter();
  const currentStyle =
    NOTIFICATION_CARD_STYLES[notificationCardStyle || "unseen"];

  const [isNavigating, setIsNavigating] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  const handleNavigate = (e: React.MouseEvent) => {
    setIsNavigating(true);
    e.stopPropagation();

    setTimeout(() => {
      notification.is_read = true;
      router.push(`/projects/${notification.tasks.project_id}/kanban`);

      setIsNavigating(false);
    }, 3000);
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    setIsMarkingRead(true);
    e.stopPropagation();

    setTimeout(() => {
      notification.is_read = true;

      setIsMarkingRead(false);
    }, 3000);
  };

  return (
    <Card className={cn("w-[500px]", currentStyle.card)}>
      <CardContent className="flex flex-row gap-4">
        <Info className="w-8 h-8" />

        {/* METADATA */}
        <div className="flex flex-col flex-1">
          <h2
            className={cn(
              "text-lg font-bold line-clamp-1 max-w-[60ch]",
              currentStyle.title,
            )}
          >
            {notification.title}
          </h2>

          <p
            className={cn(
              "mt-1 text-base line-clamp-2 max-w-[60-ch]",
              currentStyle.message,
            )}
          >
            {notification.message}
          </p>

          <span className="mt-2 block ml-auto text-sm text-muted-foreground">
            {format(
              new Date(notification.created_at),
              "MMM d, yyyy 'at' h:mm a",
            )}
          </span>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col">
          <ButtonGroup orientation="vertical">
            <Button
              type="button"
              variant="outline"
              disabled={isNavigating}
              onClick={handleNavigate}
              className="cursor-pointer"
            >
              {isNavigating ? <Spinner /> : <ArrowUpRight />}
            </Button>

            {!notification.is_read && (
              <Button
                type="button"
                variant="outline"
                disabled={isMarkingRead}
                onClick={handleMarkAsRead}
                className="cursor-pointer"
              >
                {isMarkingRead ? <Spinner /> : <MailOpen />}
              </Button>
            )}
          </ButtonGroup>
        </div>
      </CardContent>
    </Card>
  );
}
