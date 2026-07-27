import { Card, CardContent } from "../ui/card";
import { useState } from "react";
import { RevampTaskDraftValues } from "@/schemas/revamp-task.schema";
import { GeneratedTask } from "@/types/task.type";
import TitleInput from "../inputs/title-input";
import DateTimePicker from "../inputs/date-time-picker.input";

type RevampTaskCardProps = {
  task: GeneratedTask;
};

export default function RevampTaskCard({ task }: RevampTaskCardProps) {
  const [isCommitting, setIsCommitting] = useState(false);

  const getInitialDraft = (): RevampTaskDraftValues => ({
    title: task.title ?? "",
    description: task.description ?? "",
    statusId: "e152eec0-fb60-4839-ba14-427a5d503f3a",
    dueDate: new Date(),
    assigneeIds: [],
  });

  const [draft, setDraft] = useState<RevampTaskDraftValues>(getInitialDraft);

  const updateDraft = <K extends keyof RevampTaskDraftValues>(
    field: K,
    value: RevampTaskDraftValues[K],
  ) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleCommit = async () => {
    if (draft.title?.trim() === task.title) return;
    if (draft.description?.trim() === task.description) return;

    setIsCommitting(true);
    setTimeout(() => {
      console.log(draft);
      setIsCommitting(false);
    }, 3000);
  };

  const onCancel = () => {
    setDraft();
  };

  return (
    <Card className="w-full">
      <CardContent>
        <TitleInput
          value={draft.title}
          onChange={(e) => updateDraft("title", e.target.value)}
          disabled={isCommitting}
          onBlur={handleCommit}
          className="text-xl! line-clamp-2"
        />

        <div className="flex justify-between items-center">
          <div className="flex flex-col"></div>

          <div className="flex flex-col">
            <DateTimePicker />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
