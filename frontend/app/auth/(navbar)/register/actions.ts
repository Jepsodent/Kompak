"use server";

import { StatusMessage } from "@/types/auth";
import { createClient } from "@/utils/supabase/server";

export async function registerWithEmail(
  formData: FormData,
): Promise<StatusMessage> {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const passwordConfirmation = formData.get("passwordConfirmation") as string;

  if (!username || !email || !password || !passwordConfirmation) {
    return { type: "error", text: "All fields are required!" };
  }
  if (password !== passwordConfirmation) {
    return {
      type: "error",
      text: "Passwords do not match. Please check again!",
    };
  }
  if (password.length < 6) {
    return {
      type: "error",
      text: "Password must be at least 6 characters long.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: username,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });
  if (error) {
    return { type: "error", text: error.message };
  }

  return {
    type: "success",
    text: "Registration successful! Please check your email inbox to verify your account.",
  };
}
