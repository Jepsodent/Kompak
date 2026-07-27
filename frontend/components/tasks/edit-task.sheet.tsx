import { TASK_STATUSES } from "@/constants/tasks.constant";
import { useProjectDetails } from "@/hooks/useProjectDetails";
import { useTaskDetail, useUpdateTask } from "@/hooks/useTask";
import { CreateTaskFormValues, createTaskSchema } from "@/schemas/task.schema";
import { StatusMessage } from "@/types/auth.type";
import { Task } from "@/types/task.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import MultiSelectAssignees from "./multi-select-assignee";
import DateTimePicker from "../inputs/date-time-picker";
import { Alert, AlertAction, AlertDescription } from "../ui/alert";
import { CheckCircle2, CircleX } from "lucide-react";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

interface EdiTaskSheetProps {
  projectId: string;
  selectedTaskId: string | null;
  setSelectedTaskId: Dispatch<SetStateAction<string | null>>;
  isEditTaskSheetOpen?: boolean;
  setIsEditTaskSheetOpen?: Dispatch<SetStateAction<boolean>>;
}

export default function EditTaskSheet({
  projectId,
  selectedTaskId,
  setSelectedTaskId,
  isEditTaskSheetOpen,
  setIsEditTaskSheetOpen,
}: EdiTaskSheetProps) {
  const [alertMessage, setAlertMessage] = useState<StatusMessage>({
    type: null,
    text: "",
  });

  const { members, isLoading: isLoadingMembers } = useProjectDetails(projectId);
  const { data: task, isLoading: isLoadingTask } = useTaskDetail(
    projectId,
    selectedTaskId!,
  );
  const updateTaskMutation = useUpdateTask(projectId);
  const isPending = updateTaskMutation.isPending;

  const form = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: new Date(),
      statusId: TASK_STATUSES[0].id,
      assigneeIds: [],
    },
  });

  useEffect(() => {
    if (task) {
      // Map assignees: [{ member: { id: "3dcc..." } }] -> ["3dcc..."]
      const initialAssigneeIds =
        task.assignees
          ?.map((a: any) => a?.member?.id || (typeof a === "string" ? a : null))
          .filter(Boolean) || [];

      form.reset({
        title: task.title,
        description: task.description || "",
        dueDate: task.due_date ? new Date(task.due_date) : new Date(),
        statusId: task.status?.id || TASK_STATUSES[0].id,
        assigneeIds: initialAssigneeIds,
      });
      setAlertMessage({ type: null, text: "" });
    }
  }, [task, form]);

  const onSubmitUpdateTask = async (values: CreateTaskFormValues) => {
    if (!task) return;
    setAlertMessage({ text: "", type: null });

    try {
      await updateTaskMutation.mutateAsync({
        taskId: task.id,
        payload: {
          title: values.title,
          description: values.description || undefined,
          due_date: values.dueDate.toISOString(),
          status_id: values.statusId,
          assignee_ids: values.assigneeIds,
        },
      });

      setAlertMessage({
        type: "success",
        text: "Task updated successfully!",
      });

      setTimeout(() => {
        setIsEditTaskSheetOpen!(false);
      }, 500);
    } catch (err: any) {
      setAlertMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed to update task details.",
      });
    }
  };

  const handleClose = (open: boolean) => {
    if (setIsEditTaskSheetOpen) {
      setIsEditTaskSheetOpen(open);
    }

    if (!open) {
      setSelectedTaskId(null);
    }
  };

  return (
    <Sheet open={isEditTaskSheetOpen} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="px-8 py-16 w-full! sm:max-w-md! md:max-w-lg! lg:max-w-xl! xl:max-w-2xl! overflow-y-auto"
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitUpdateTask)}
            className="flex flex-col gap-8"
          >
            {/* TITLE */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      disabled={isPending}
                      placeholder="Add a title"
                      className="min-h-[80px] resize-y border-none shadow-none bg-card! focus-visible:ring-0 focus-visible:bg-accent/30 p-0 rounded-md text-2xl! font-bold! leading-relaxed transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* METADATA */}
            <div className="w-full flex flex-col items-center gap-2">
              {/* STATUS */}
              <div className="w-full flex justify-start items-center">
                <span className="block w-[30%] text-muted-foreground text-sm">
                  Status
                </span>

                <FormField
                  control={form.control}
                  name="statusId"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        disabled={isPending}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder="Select status"
                              className="text-sm! bg-card! m-0!"
                            />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {TASK_STATUSES.map((status) => (
                            <SelectItem
                              key={status.id}
                              value={status.id}
                              className="text-sm!"
                            >
                              {status.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Assignees */}
              <div className="w-full flex justify-start items-center">
                <span className="block w-[30%] text-muted-foreground text-sm">
                  Assignee
                </span>

                <FormField
                  control={form.control}
                  name="assigneeIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <MultiSelectAssignees
                          members={members}
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isPending || isLoadingMembers}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Due */}
              <div className="w-full flex justify-start items-center">
                <span className="block w-[30%] text-muted-foreground text-sm">
                  Due Date
                </span>

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormControl>
                        <DateTimePicker
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      disabled={isPending}
                      placeholder="Add a detailed description..."
                      className="min-h-[160px] resize-y border-none shadow-none bg-card! focus-visible:ring-0 focus-visible:bg-accent/30 p-0 rounded-md text-lg! leading-relaxed transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="border p-0">
              {/* Alert Status */}
              {/* Alert Status */}
              {alertMessage.type && (
                <Alert variant={alertMessage.type}>
                  {alertMessage.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <CircleX className="h-4 w-4" />
                  )}
                  <AlertDescription className="w-full">
                    {alertMessage.text}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isPending}
                className="cursor-pointer w-full!"
              >
                {isPending ? (
                  <>
                    <Spinner />
                    <span>Saving changes...</span>
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
