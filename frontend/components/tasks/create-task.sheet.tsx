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
      title: "Untitled Task",
      description: "Add a detailed description...",
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

      <SheetContent
        side="right"
        className="px-8 py-16 w-full! sm:max-w-md! md:max-w-lg! lg:max-w-xl! xl:max-w-2xl! overflow-y-auto"
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitCreateTask)}
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
                      className="min-h-0 resize-y border-none shadow-none bg-card! focus-visible:ring-0 focus-visible:bg-accent/30 p-0 rounded-md text-2xl! font-bold! leading-relaxed transition-all"
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
                      className="min-h-0 resize-y border-none shadow-none bg-card! focus-visible:ring-0 focus-visible:bg-accent/30 p-0 rounded-md text-lg! leading-relaxed transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="w-full p-0!">
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
