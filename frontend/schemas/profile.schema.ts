import { z } from "zod";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGES_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const editProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters.")
    .max(30, "Name must be no more than 30 characters.")
    .regex(
      /^[\p{L}\p{N}_]+$/u,
      "Username can only contain letters, numbers, and underscores.",
    ),
  profileImage: z
    .instanceof(File)
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      "Image must be smaller than 2MB",
    )
    .refine(
      (file) => ACCEPTED_IMAGES_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png, .webp formats are supported.",
    )
    .optional()
    .nullable(),
});
export type EditProfileFormValues = z.infer<typeof editProfileSchema>;

export const deleteAccountSchema = z.object({
  password: z
    .string()
    .min(1, "Password is required to confirm account deletion."),
});
export type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>;
