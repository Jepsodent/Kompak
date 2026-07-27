"use client";

import ContributionCard from "@/components/contributions/contribution-card";
import ContributionSheet from "@/components/contributions/contribution-sheet";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useState } from "react";

const CONTRIBUTIONS: GetContributionsPayload[] = [
  {
    id: "CON01",
    title: "Contribution Report 26/8/2026",
    type: "CONTRIBUTION",
    created_at: "2026-07-26T09:57:33.161Z",
    created_by: {
      profiles: {
        name: "Jefferson",
        profile_image_url: "https://github.com/evilrabbit.png",
      },
    },
  },
  {
    id: "CON02",
    title: "Hello",
    type: "CONTRIBUTION Report 26/7/2026",
    created_at: "2026-06-26T09:57:33.161Z",
    created_by: {
      profiles: {
        name: "Jefferson",
        profile_image_url: "https://github.com/evilrabbit.png",
      },
    },
  },
];

export default function ContributionsPage() {
  const [isPending, setIsPending] = useState(false);

  const [activeContributionId, setActiveContributionId] = useState<
    null | string
  >(null);
  const [isContributionSheetOpen, setIsContributionSheetOpen] = useState(false);

  const handleCreateReport = () => {
    setIsPending(true);

    setTimeout(() => {
      toast.add({
        type: "success",
        description: "Report has been created!",
      });

      setIsPending(false);
    }, 3000);
  };

  return (
    <div className="w-full h-full flex flex-col items-center gap-2">
      {/* TOOLBAR */}
      <div className="w-full h-[3rem] flex items-center justify-between">
        {/* LEFT CONTAINER */}
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">Total reports: </span>
          <span className="text-sm text-medium">{CONTRIBUTIONS.length}</span>
        </div>

        {/* RIGHT CONTAINER */}
        <div>
          <Button
            type="button"
            variant="default"
            disabled={isPending}
            onClick={handleCreateReport}
          >
            {isPending ? (
              <div className="flex items-center gap-1.5">
                <Spinner /> <span>Creating...</span>
              </div>
            ) : (
              "Create Report"
            )}
          </Button>
        </div>
      </div>

      {/* REPORT GRIDS */}
      <div className="w-full h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {CONTRIBUTIONS.map((contribution) => (
          <ContributionCard
            key={contribution.id}
            contribution={contribution}
            setActiveContributionId={setActiveContributionId}
            setIsContributionSheetOpen={setIsContributionSheetOpen}
          />
        ))}
      </div>

      <ContributionSheet
        contributionId={activeContributionId}
        isContributionSheetOpen={isContributionSheetOpen}
        setIsContributionSheetOpen={setIsContributionSheetOpen}
      />
    </div>
  );
}
