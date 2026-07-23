import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "A title is required")
    .max(128, "A title can't be more than 32 characters"),
  description: z
    .string()
    .max(1024, "A description can't be more than 512 characters")
    .nullable()
    .optional(),
  dueDate: z.date(),
  statusId: z.string().uuid("Invalid status selection"),
  assigneeIds: z.array(z.string().uuid()).optional(),
});
export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;
