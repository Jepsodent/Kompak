"use client";

import { format } from "date-fns";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Avatar, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";

type ContributionCardProps = {
  contribution: GetContributionsPayload;
  setActiveContributionId: Dispatch<SetStateAction<null | string>>;
  setIsContributionSheetOpen: Dispatch<SetStateAction<boolean>>;
};

export default function ContributionCard({
  contribution,
  setActiveContributionId,
  setIsContributionSheetOpen,
}: ContributionCardProps) {
  return (
    <Card
      onClick={() => {
        setActiveContributionId(contribution.id);
        setIsContributionSheetOpen(true);
      }}
      className={cn(
        "w-full h-[150px] cursor-pointer transition duration-200",
        "hover:bg-foreground/5",
      )}
    >
      <CardContent className="h-full flex flex-col justify-between">
        {/* METADATA */}
        <h2 className="text-xl font-bold line-clamp-2">{contribution.title}</h2>

        {/* SMALLER METADATA */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Created at</span>

            <span className="text-sm font-medium">
              {format(contribution.created_at, "MMM d, yyyy 'at' h:mm a")}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Created by</span>

            <div className="flex justify-end items-center gap-2">
              <Avatar className="size-5">
                <AvatarImage
                  src={contribution.created_by.profiles.profile_image_url}
                />
              </Avatar>

              <span className="text-sm font-medium">
                {contribution.created_by.profiles.name}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
