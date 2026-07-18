"use server";

import {
  ChangeEmailFormValues,
  changeEmailSchema,
  LoginFormValues,
  loginSchema,
  MagicLinkFormValues,
  magicLinkSchema,
  RegisterFormValues,
  registerSchema,
  UpdatePasswordFormValues,
  updatePasswordSchema,
} from "@/schemas/auth.schema";
import { StatusMessage } from "@/types/auth.type";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

type ProviderLoginResponse = StatusMessage & {
  url?: string;
};

export async function loginWithEmail(
  data: LoginFormValues,
): Promise<StatusMessage> {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return {
      type: "error",
      text: "Parsing failed because of invalid form data.",
    };
  }

  const { email, password } = result.data;

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
  data: MagicLinkFormValues,
): Promise<StatusMessage> {
  const result = magicLinkSchema.safeParse(data);
  if (!result.success) {
    return {
      type: "error",
      text: "Parsing failed because of invalid form data.",
    };
  }

  const { email } = result.data;
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/app/overview`,
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
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/dashboard`,
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

export async function registerUserAction(
  data: RegisterFormValues,
): Promise<StatusMessage> {
  const result = registerSchema.safeParse(data);
  if (!result.success) {
    return {
      type: "error",
      text: "Parsing failed because of invalid form data.",
    };
  }
  const { username, email, password } = result.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: username,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/app/overview`,
    },
  });
  console.log(error);
  if (error) {
    return {
      type: "error",
      text:
        error.message ||
        String(error) ||
        "An unexpected authentication error occurred.",
    };
  }

  return {
    type: "success",
    text: "Registration successful! Please check your email inbox to verify your account.",
  };
}

export async function sendPasswordResetLink(
  data: MagicLinkFormValues,
): Promise<StatusMessage> {
  const result = magicLinkSchema.safeParse(data);
  if (!result.success) {
    return {
      type: "error",
      text: "Parsing failed because of invalid form data.",
    };
  }

  const { email } = result.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/update-password`,
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
  data: UpdatePasswordFormValues,
): Promise<StatusMessage> {
  const result = updatePasswordSchema.safeParse(data);
  if (!result.success) {
    return {
      type: "error",
      text: "Parsing failed because of invalid form data.",
    };
  }

  const { password } = result.data;

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

  redirect("/quick-login");
}

export async function changeUserEmail(
  data: ChangeEmailFormValues,
): Promise<StatusMessage> {
  const result = changeEmailSchema.safeParse(data);
  if (!result.success) {
    return {
      type: "error",
      text: "Parsing failed because of invalid form data.",
    };
  }

  const { newEmail, password } = result.data;

  const supabase = await createClient();
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: (await supabase.auth.getUser()).data.user?.email || "",
      password,
    });
  if (authError) {
    return {
      type: "error",
      text: "Authentication failed: Incorrect password.",
    };
  }

  const { error } = await supabase.auth.updateUser(
    { email: newEmail },
    {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/settings/profile`,
    },
  );
  if (error) {
    return { type: "error", text: error.message };
  }

  return {
    type: "success",
    text: "Confirmation links sent! Please check both your old and new email addresses to verify the change.",
  };
}
