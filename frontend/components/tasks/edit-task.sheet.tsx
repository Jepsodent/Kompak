import { TASK_STATUSES } from "@/constants/tasks.constant";
import { useProjectDetails } from "@/hooks/useProjectDetails";
import { useTaskDetail, useUpdateTask } from "@/hooks/useTask";
import { CreateTaskFormValues, createTaskSchema } from "@/schemas/task.schema";
import { StatusMessage } from "@/types/auth.type";
import { Task } from "@/types/task.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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
import { Input } from "../ui/input";
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
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditTaskSheet({
  projectId,
  taskId,
  open,
  onOpenChange,
}: EdiTaskSheetProps) {
  const [alertMessage, setAlertMessage] = useState<StatusMessage>({
    type: null,
    text: "",
  });

  const { members, isLoading: isLoadingMembers } = useProjectDetails(projectId);
  const { data: task, isLoading: isLoadingTask } = useTaskDetail(
    projectId,
    taskId || undefined,
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
        onOpenChange(false);
      }, 500);
    } catch (err: any) {
      setAlertMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed to update task details.",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Task</SheetTitle>
          <SheetDescription>
            Update task information, status, or member assignments.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitUpdateTask)}
            className="px-4 flex flex-col gap-4"
          >
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="Task title..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      disabled={isPending}
                      placeholder="Task description..."
                      className="min-h-[100px] resize-y"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="statusId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    disabled={isPending}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TASK_STATUSES.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Assignees */}
            <FormField
              control={form.control}
              name="assigneeIds"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Assignees</FormLabel>
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

            {/* Due Date & Time */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date & Time</FormLabel>
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

            {/* Alert Status */}
            {alertMessage.type && (
              <Alert
                variant={
                  alertMessage.type === "error" ? "destructive" : "default"
                }
              >
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

            <SheetFooter className="w-full">
              <Button
                type="submit"
                disabled={isPending}
                className="cursor-pointer w-full"
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
