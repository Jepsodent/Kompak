"use server";

import { StatusMessage } from "@/types/auth";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function loginWithEmail(
  formData: FormData,
): Promise<StatusMessage> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  if (!email || !password) {
    return { type: "error", text: "All fields are required!" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { type: "error", text: error.message };
  }

  redirect("/dashboard");
}
