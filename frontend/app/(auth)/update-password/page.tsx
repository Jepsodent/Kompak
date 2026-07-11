"use client";

import { StatusMessage } from "@/types/auth";
import { useEffect, useState, useTransition } from "react";
import { updatePassword } from "../actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, CircleX, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "react-hook-form";
import { UpdatePasswordFormValues, updatePasswordSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [alertMessage, setAlertMessage] = useState<StatusMessage>({
    type: null,
    text: "",
  });
  const form = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
  });
  const [counter, setCounter] = useState(3);

  useEffect(() => {
    if (alertMessage.type !== "success") return;

    if (counter === 0) {
      router.push("/login");
      return;
    }

    const timer = setTimeout(() => {
      setCounter((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [alertMessage.type, counter, router]);

  const onSubmitUpdatePassword = async (values: UpdatePasswordFormValues) => {
    setAlertMessage({ type: null, text: "" });

    startTransition(async () => {
      const result = await updatePassword(values);
      setAlertMessage(result);

      if (result.type === "success") {
        form.reset();
      }
    });
  };

  return (
    <Card className="w-full max-w-sm mb-auto ml-auto mr-auto mt-[16vh]">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Update your Password
        </CardTitle>
        <CardDescription className="text-base">
          Yippee! You have been authenticated, let's reset your password.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitUpdatePassword)}>
          <CardContent className="space-y-4 mb-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      disabled={isPending}
                      placeholder="dSuklj12lkjsa0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Re-Type Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      disabled={isPending}
                      placeholder="dSuklj12lkjsa0"
                    />
                  </FormControl>
                  <FieldDescription>
                    Make sure both password matches.
                  </FieldDescription>
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

                <AlertDescription className="text-small">
                  {alertMessage.text}
                </AlertDescription>
              </Alert>
            )}

            {alertMessage.type === "success" && (
              <Alert variant="info">
                <Info className="h-4 w-4" />
                <AlertDescription className="w-full">
                  Redirecting to Login Page in {counter}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              disabled={isPending}
              variant="default"
              className="w-full cursor-pointer"
            >
              {isPending ? (
                <>
                  <Spinner />
                  <span>Updating...</span>
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
