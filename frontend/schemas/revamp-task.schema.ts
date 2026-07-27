import { z } from "zod";

export const revampTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .max(128, "A title can't be more than 32 characters")
    .nullable()
    .optional(),
  description: z
    .string()
    .trim()
    .max(1024, "A description can't be more than 1024 characters")
    .nullable()
    .optional(),
  dueDate: z.date(),
  statusId: z.string().uuid("Invalid status selection"),
  assigneeIds: z.array(z.string().uuid()).optional(),
});
export type RevampTaskDraftValues = z.infer<typeof revampTaskSchema>;
