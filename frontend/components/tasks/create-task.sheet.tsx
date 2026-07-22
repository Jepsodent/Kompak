"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";
import { StatusMessage } from "@/types/auth.type";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { CreateTaskFormValues, createTaskSchema } from "@/schemas/task.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateTask } from "@/hooks/useTask";
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
import { Spinner } from "../ui/spinner";
import { Alert, AlertDescription } from "../ui/alert";
import { CheckCircle2, CircleX } from "lucide-react";
import { TASK_STATUSES } from "@/constants/tasks.constant";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import DateTimePicker from "../inputs/date-time-picker";
import { useProjectDetails } from "@/hooks/useProjectDetails";
import MultiSelectAssignees from "./multi-select-assignee";

export default function CreateTaskSheet({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<StatusMessage>({
    type: null,
    text: "",
  });
  const { members, isLoading: isLoadingMembers } = useProjectDetails(projectId);
  const createTaskMutation = useCreateTask(projectId);
  const isPending = createTaskMutation.isPending;

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

  const onSubmitCreateTask = async (values: CreateTaskFormValues) => {
    setAlertMessage({ text: "", type: null });
    console.log(values);

    try {
      await createTaskMutation.mutateAsync({
        title: values.title,
        description: values.description || undefined,
        due_date: values.dueDate.toISOString(),
        status_id: values.statusId,
        assignee_ids: values.assigneeIds,
      });

      setAlertMessage({
        type: "success",
        text: "Task has been created successfully!",
      });

      form.reset();
      setOpen(false);
    } catch (err: any) {
      setAlertMessage({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Something went wrong when creating a task.",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="secondary">Create a Task</Button>}
      />

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create a Task</SheetTitle>
          <SheetDescription>
            Fill in the form to create a task.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitCreateTask)}>
            <div className="flex flex-col gap-2 p-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoFocus
                        disabled={isPending}
                        placeholder="Task title..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        placeholder="Add details about this task..."
                        className="min-h-[100px] resize-y"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status Selection */}
              <FormField
                control={form.control}
                name="statusId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      disabled={isPending}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select initial status" />
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

              {/* DateTimePicker */}
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

              {/* Assignee */}
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
            </div>

            <SheetFooter>
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
                className="cursor-pointer w-full"
              >
                {isPending ? (
                  <>
                    <Spinner />
                    <span>Creating...</span>
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
