"use server";

import { StatusMessage } from "@/types/auth";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

type ProviderLoginResponse = StatusMessage & {
  url?: string;
};

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
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard`,
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

export async function loginWithProvider(
  provider: "google" | "github",
): Promise<ProviderLoginResponse> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard`,
    },
  });
  if (error) {
    return { type: "error", text: error.message };
  }
  if (data?.url) {
    return {
      type: "success",
      text: "Permission granted! You're logged in.",
      url: data.url,
    };
  }

  return {
    type: "error",
    text: "Failed to generate authorization path.",
  };
}

export async function register(formData: FormData): Promise<StatusMessage> {
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
      text: "Passwords do not match. Please match them up!",
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
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard`,
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
    text: `A reset link has been sent. Please check your inbox!`,
  };
}

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

  await supabase.auth.signOut();

  return {
    type: "success",
    text: "Password has been reset!",
  };
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/auth/login");
}
