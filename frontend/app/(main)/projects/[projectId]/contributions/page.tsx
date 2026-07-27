"use client";

import ContributionCard from "@/components/contributions/contribution-card";
import ContributionSheet from "@/components/contributions/contribution-sheet";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import {
  useContributions,
  useCreateContribution,
} from "@/hooks/useContribution";
import { FileText, HeartCrack } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

type ContributionsPage = {
  params: Promise<{ projectId: string }>;
};

export default function ContributionsPage({ params }: ContributionsPage) {
  const { projectId } = use(params);
  const router = useRouter();

  const {
    data: contributions,
    isLoading: isContributionsLoading,
    isError: contributionsError,
  } = useContributions(projectId);
  const {
    mutateAsync: createProject,
    isPending: isContributionPending,
    error: isContributionError,
  } = useCreateContribution(projectId);

  const [activeContributionId, setActiveContributionId] = useState<string>("");
  const [isContributionSheetOpen, setIsContributionSheetOpen] = useState(false);

  const handleCreateContributionReport = async () => {
    try {
      await createProject();
      toast.add({ type: "success", description: "Report has been created!" });
    } catch (err: any) {
      toast.add({ type: "error", description: "Failed creating a report" });
    }
  };

  if (isContributionsLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center gap-2">
        <Spinner className="w-4 h-4" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (contributionsError && !contributions) {
    return (
      <div className="w-full h-full flex justify-center items-center gap-2">
        <HeartCrack className="w-4 h-4" />
        <span className="text-sm text-muted-foreground">
          Error fetching contribution reports
        </span>
      </div>
    );
  }

  if (contributions?.length === 0) {
    return (
      <Empty className="w-full h-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileText />
          </EmptyMedia>

          <EmptyTitle>No Report Yet</EmptyTitle>
          <EmptyDescription className="max-w-xs">
            You&apos;re all caught up. New notifications will appear here.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent>
          <Button
            type="button"
            variant="default"
            disabled={isContributionPending}
            onClick={handleCreateContributionReport}
            className="cursor-pointer"
          >
            {isContributionPending ? (
              <div className="flex items-center gap-1.5">
                <Spinner />
                <span>Creating...</span>
              </div>
            ) : (
              "Create Report"
            )}
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center gap-2">
      {/* TOOLBAR */}
      <div className="w-full h-[3rem] flex justify-between items-center ">
        {/* LEFT CONTAINER */}
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">Total reports: </span>
          <span className="text-sm font-medium">{contributions?.length}</span>
        </div>

        {/* RIGHT CONTAINER */}
        <div>
          <Button
            type="button"
            variant="default"
            disabled={isContributionPending}
            onClick={handleCreateContributionReport}
            className="cursor-pointer"
          >
            {isContributionPending ? (
              <div className="flex items-center gap-1.5">
                <Spinner />
                <span>Creating...</span>
              </div>
            ) : (
              "Create Report"
            )}
          </Button>
        </div>
      </div>

      {/* REPORT GRIDS */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {contributions?.map((contribution) => (
          <ContributionCard
            key={contribution.id}
            contribution={contribution}
            setActiveContributionId={setActiveContributionId}
            setIsContributionSheetOpen={setIsContributionSheetOpen}
          />
        ))}
      </div>

      <ContributionSheet
        projectId={projectId}
        contributionId={activeContributionId}
        isContributionSheetOpen={isContributionSheetOpen}
        setIsContributionSheetOpen={setIsContributionSheetOpen}
      />
    </div>
  );
}
