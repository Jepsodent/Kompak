"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { changeUserEmail } from "@/app/(auth)/actions";
import {
  changeEmailSchema,
  ChangeEmailFormValues,
} from "@/schemas/auth.schema";
import { StatusMessage } from "@/types/auth.type";
import { Spinner } from "../ui/spinner";

export default function ChangeEmailDialog() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<StatusMessage>({ text: "", type: null });

  const form = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: "",
      password: "",
    },
  });

  const onSubmitEmailChange = (values: ChangeEmailFormValues) => {
    setStatus({ text: "", type: null });

    startTransition(async () => {
      try {
        const response = await changeUserEmail(values);
        setStatus(response);

        if (response.type === "success") {
          form.reset();
        }
      } catch (err: any) {
        setStatus({
          type: "error",
          text:
            err?.message || "An unexpected error occurred. Please try again.",
        });
      }
    });
  };

  return (
    <Dialog
      onOpenChange={(open) =>
        !open && (form.reset(), setStatus({ text: "", type: null }))
      }
    >
      {/* Trigger button visible on the main settings view */}
      <DialogTrigger asChild>
        <Button variant="secondary" className="cursor-pointer">
          Change Email Address
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Change Email Address
          </DialogTitle>
          <DialogDescription className="text-base">
            Enter your new email address and confirm your current password.
            Supabase will send verification links to both addresses.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitEmailChange)}
            className="space-y-4 py-2"
          >
            {/* New Email Input Field */}
            <FormField
              control={form.control}
              name="newEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Confirmation Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your current password"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Response Banner (Success / Error) */}
            {status.text && (
              <div
                className={`text-xs font-medium p-3 rounded-md border ${
                  status.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-destructive/10 text-destructive border-destructive/20"
                }`}
              >
                {status.text}
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
              </DialogClose>

              <Button
                type="submit"
                disabled={isPending || !form.formState.isValid}
                className="cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Spinner /> "Updating..."
                  </>
                ) : (
                  "Update Email"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
