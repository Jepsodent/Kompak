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
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CheckCircle2, CircleX } from "lucide-react";
import { useState, useTransition } from "react";
import { loginWithEmail } from "../../actions";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { LoginFormValues, loginSchema } from "@/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [loginMessage, setLoginMessage] = useState<StatusMessage>({
    type: null,
    text: "",
  });
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmitLogin = async (values: LoginFormValues) => {
    setLoginMessage({ type: null, text: "" });

    startTransition(async () => {
      const result = await loginWithEmail(values);
      setLoginMessage(result);

      if (result.type === "success") {
        form.reset();
      }
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Login</CardTitle>
        <CardDescription className="text-base">
          Already have an account? Awesome! Input your credentials below and
          login.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitLogin)}>
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
                  <FormDescription>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-semibold text-brand"
                    >
                      Forgot Password?
                    </Link>
                  </FormDescription>
                </FormItem>
              )}
            />

            {loginMessage.type && (
              <Alert variant={loginMessage.type}>
                {loginMessage.type === "success" && (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {loginMessage.type === "error" && (
                  <CircleX className="h-4 w-4" />
                )}

                <AlertDescription className="w-full">
                  {loginMessage.text}
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
                  <Spinner /> <span>Logging in...</span>
                </>
              ) : (
                "Login"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
