"use client";

import { Dispatch, SetStateAction, use } from "react";
import { Sheet, SheetContent } from "../ui/sheet";
import { useContributionById } from "@/hooks/useContribution";
import { Spinner } from "../ui/spinner";
import { HeartCrack } from "lucide-react";

type ContributionSheetProps = {
  projectId: string;
  contributionId: string;
  isContributionSheetOpen: boolean;
  setIsContributionSheetOpen: Dispatch<SetStateAction<boolean>>;
};

export default function ContributionSheet({
  projectId,
  contributionId,
  isContributionSheetOpen,
  setIsContributionSheetOpen,
}: ContributionSheetProps) {
  const {
    data: contribution,
    isLoading: isContributionLoading,
    error: contributionError,
  } = useContributionById(projectId, contributionId);

  return (
    <Sheet
      open={isContributionSheetOpen}
      onOpenChange={setIsContributionSheetOpen}
    >
      <SheetContent className="max-w-full! w-full! md:max-w-[800px]! p-4">
        {isContributionLoading && (
          <div className="w-full h-full flex justify-center items-center gap-1.5">
            <Spinner className="w-4 h-4 text-muted-foreground" />

            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        )}

        {contributionError && !contribution && (
          <div className="w-full h-full flex justify-center items-center gap-1.5">
            <HeartCrack className="w-4 h-4 text-muted-foreground" />

            <span className="text-sm text-muted-foreground">
              Failed fetching contribution
            </span>
          </div>
        )}

        {contribution && (
          <div className="w-full h-full">
            <h2 className="text-2xl font-bold tracking-tight">
              {contribution.title}
            </h2>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
