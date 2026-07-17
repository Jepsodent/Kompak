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
import { Input } from "@/components/ui/input";
import { StatusMessage } from "@/types/auth";
import { CheckCircle2, CircleX } from "lucide-react";
import { useState, useTransition } from "react";
import { registerUserAction } from "../../actions";
import { Spinner } from "@/components/ui/spinner";
import { RegisterFormValues, registerSchema } from "@/schemas/auth.schema";
import { useForm } from "react-hook-form";
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

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition();
  const [registerMessage, setRegisterMessage] = useState<StatusMessage>({
    text: "",
    type: null,
  });
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmitRegister = async (values: RegisterFormValues) => {
    setRegisterMessage({ text: "", type: null });

    startTransition(async () => {
      const result = await registerUserAction(values);
      setRegisterMessage(result);

      if (result.type === "success") {
        form.reset();
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Register a New Account
        </CardTitle>
        <CardDescription className="text-base">
          No account yet? No worries, just fill the inputs below and register.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitRegister)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder="GoodGuyDonnie86"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      disabled={isPending}
                      placeholder="sigma@example.com"
                      {...field}
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
                      disabled={isPending}
                      placeholder="dSuklj12lkjsa0"
                      {...field}
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
                      disabled={isPending}
                      placeholder="dSuklj12lkjsa0"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Make sure both passwords match.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {registerMessage.type && (
              <Alert variant={registerMessage.type}>
                {registerMessage.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <CircleX className="h-4 w-4" />
                )}
                <AlertDescription className="w-full">
                  {registerMessage.text}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter className="mt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full cursor-pointer"
            >
              {isPending ? (
                <>
                  <Spinner /> Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
