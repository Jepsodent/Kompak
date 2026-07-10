"use server";

import { StatusMessage } from "@/types/auth";
import { createClient } from "@/utils/supabase/server";

export async function updatePassword(
  formData: FormData,
): Promise<StatusMessage> {
  const password = formData.get("password") as string;
  const passwordConfirmation = formData.get("passwordConfirmation") as string;
  if (!password || !passwordConfirmation) {
    return { type: "error", text: "All fields are required!" };
  }
  if (password !== passwordConfirmation) {
    return {
      type: "error",
      text: "Passwords do not match. Please check again!",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: password,
  });
  if (error) {
    return {
      type: "error",
      text: error.message,
    };
  }

  return {
    type: "success",
    text: "Password has been reset!",
  };
}
