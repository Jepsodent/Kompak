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
      .min(4, "Username must be at least 4 characters.")
      .max(16, "Username must be no more than 16 characters.")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letter, numbers, and underscores.",
      ),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Email address is required.")
      .email("Please provide a valid email format."),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters.")
      .max(32, "Password must be no more than 32 characters."),
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
