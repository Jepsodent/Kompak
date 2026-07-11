"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { StatusMessage } from "@/types/auth";
import { CheckCircle2, CircleX } from "lucide-react";
import { useState, useTransition } from "react";
import Link from "next/link";
import { sendPasswordResetLink } from "../actions";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "react-hook-form";
import { MagicLinkFormValues, magicLinkSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [alertMessage, setAlertMessage] = useState<StatusMessage>({
    type: null,
    text: "",
  });
  const form = useForm<MagicLinkFormValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmitSendPasswordResetLink = async (values: MagicLinkFormValues) => {
    setAlertMessage({ type: null, text: "" });

    startTransition(async () => {
      const result = await sendPasswordResetLink(values);
      setAlertMessage(result);

      if (result.type === "success") {
        form.reset();
      }
    });
  };

  return (
    <Card className="w-full max-w-sm mb-auto ml-auto mr-auto mt-[16vh]">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Forgot Password?</CardTitle>
        <CardDescription className="text-base">
          Passwords are annoying aren't they? Fill the form below and we'll send
          you a link to reset them
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitSendPasswordResetLink)}>
          <CardContent className="space-y-4 mb-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="sigma@example.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {alertMessage.type && (
              <Alert variant={alertMessage.type}>
                {alertMessage.type === "success" && (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {alertMessage.type === "error" && (
                  <CircleX className="h-4 w-4" />
                )}

                <AlertDescription className="text-sm">
                  {alertMessage.text}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <Button
              type="submit"
              disabled={isPending}
              variant="default"
              className="w-full text-sm cursor-pointer"
            >
              {isPending ? (
                <>
                  <Spinner /> <span>Sending...</span>
                </>
              ) : (
                "Send Link"
              )}
            </Button>

            <Link href="/login" className="text-sm font-semibold text-brand">
              Back to login
            </Link>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
