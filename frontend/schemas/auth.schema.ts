import { z } from "zod";

export const magicLinkSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required.")
    .email("Please provide a valid email format.")
    .trim()
    .toLowerCase(),
});
export type MagicLinkFormValues = z.infer<typeof magicLinkSchema>;

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters.")
      .max(30, "Username must be no more than 30 characters.")
      .regex(
        /^[\p{L}\p{N}_]+$/u,
        "Username can only contain letters, numbers, and underscores.",
      ),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please provide a valid email format."),
    password: z
      .string()
      .min(8, "Password must be at least 6 characters.")
      .max(72, "Password must be no more than 32 characters."),
    passwordConfirmation: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords must match",
    path: ["passwordConfirmation"],
  });
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email address is required.")
    .email(),
  password: z
    .string()
    .min(1, "Password is required.")
    .max(32, "Password must be no more than 32 characters."),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters.")
      .max(32, "Password must be no more than 32 characters."),
    passwordConfirmation: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords must match.",
    path: ["passwordConfirmation"],
  });
export type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

export const changeEmailSchema = z.object({
  newEmail: z
    .string()
    .min(1, "Email is required.")
    .email("Invalid email format."),
  password: z.string().min(1, "Password is required to confirm identity."),
});
export type ChangeEmailFormValues = z.infer<typeof changeEmailSchema>;
