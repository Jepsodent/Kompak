"use server";

import { createClient } from "@/utils/supabase/server";
import { StatusMessage } from "@/types/auth";

export async function loginWithMagicLink(
  formData: FormData,
): Promise<StatusMessage> {
  const email = formData.get("email") as string;
  if (!email) {
    return {
      type: "error",
      text: "Email address is required!",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return {
      type: "error",
      text: error.message,
    };
  }

  return {
    type: "success",
    text: "A magic link has been sent to your email. Please check your inbox!",
  };
}

type ProviderLoginResponse = StatusMessage & {
  url?: string;
};

export async function loginWithProvider(
  provider: "google" | "github",
): Promise<ProviderLoginResponse> {
  // 1. Await the server client initialization
  const supabase = await createClient();

  // 2. Put the 'await' keyword at the front of the entire execution chain!
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { type: "error", text: error.message };
  }

  if (data?.url) {
    return { type: "success", text: "", url: data.url };
  }

  return {
    type: "error",
    text: "Failed to generate authorization path.",
  };
}
