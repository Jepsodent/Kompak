"use client";

import { Dispatch, SetStateAction } from "react";
import { Sheet, SheetContent } from "../ui/sheet";

type ContributionSheetProps = {
  contributionId: null | string;
  isContributionSheetOpen: boolean;
  setIsContributionSheetOpen: Dispatch<SetStateAction<boolean>>;
};

export default function ContributionSheet({
  contributionId,
  isContributionSheetOpen,
  setIsContributionSheetOpen,
}: ContributionSheetProps) {
  return (
    <Sheet
      open={isContributionSheetOpen}
      onOpenChange={setIsContributionSheetOpen}
    >
      <SheetContent className="max-w-full! w-full! md:max-w-[800px]! p-4">
        <p className="text-2xl font-bold">I hat etesting out</p>
      </SheetContent>
    </Sheet>
  );
}
