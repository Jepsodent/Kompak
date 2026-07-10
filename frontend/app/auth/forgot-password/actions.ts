"use server";

import { StatusMessage } from "@/types/auth";
import { createClient } from "@/utils/supabase/server";

export async function sendPasswordResetLink(
  formData: FormData,
): Promise<StatusMessage> {
  const email = formData.get("email") as string;
  if (!email) {
    return { type: "error", text: "Email address is required!" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/auth/update-password`,
  });

  if (error) {
    return { type: "error", text: error.message };
  }

  return {
    type: "success",
    text: `A reset link has been sent to ${email}. Please check your inbox!`,
  };
}
