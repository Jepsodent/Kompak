"use client";

import { useTransition, useState } from "react";
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

import { useDeleteAccount } from "@/hooks/useProfile";
import {
  DeleteAccountFormValues,
  deleteAccountSchema,
} from "@/schemas/profile.schema";
import { Spinner } from "../ui/spinner";

export default function DeleteAccountDialog() {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState("");

  const deleteAccountMutation = useDeleteAccount();

  const form = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmitDelete = (values: DeleteAccountFormValues) => {
    setErrorMessage("");

    startTransition(async () => {
      try {
        await deleteAccountMutation.mutateAsync(values.password);
      } catch (err: any) {
        setErrorMessage(
          err?.response?.data?.message ||
            "Incorrect password. Please try again.",
        );
      }
    });
  };

  return (
    <Dialog onOpenChange={(open) => !open && form.reset()}>
      {/* The visible trigger button that sits in your settings layout */}
      <DialogTrigger render={<Button variant="destructive" className="cursor-pointer" />}>
        Delete Account
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Delete Account Confirmation
          </DialogTitle>
          <DialogDescription className="text-base text-destructive">
            Warning: This action is permanent. All of your spaces, tasks, and
            profile data will be erased forever.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitDelete)}
            className="space-y-4 py-2"
          >
            {/* Password Verification Node */}
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

            {/* Runtime API Rejection Feedback Banner */}
            {errorMessage && (
              <p className="text-xs text-destructive font-medium bg-destructive/10 border border-destructive/20 p-2.5 rounded-md">
                {errorMessage}
              </p>
            )}

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <DialogClose render={<Button type="button" variant="outline" disabled={isPending} className="cursor-pointer" />}>
                Cancel
              </DialogClose>

              <Button
                type="submit"
                variant="destructive"
                disabled={isPending || !form.formState.isValid}
                className="cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Spinner /> "Processing..."
                  </>
                ) : (
                  "Permanently Delete"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
