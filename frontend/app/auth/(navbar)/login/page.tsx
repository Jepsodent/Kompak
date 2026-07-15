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
import { StatusMessage } from "@/types/auth.type";
import { CheckCircle2, CircleX } from "lucide-react";
import { useState, useTransition } from "react";
import { loginWithEmail } from "../../actions";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [loginMessage, setLoginMessage] = useState<StatusMessage>({
    type: null,
    text: "",
  });
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (formData: FormData) => {
    setLoginMessage({ type: null, text: "" });

    startTransition(async () => {
      const result = await loginWithEmail(formData);
      setLoginMessage(result);
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

      <form action={handleLogin}>
        <CardContent className="space-y-4 mb-4">
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="sigma@example.com"
              value={formValues.email}
              onChange={handleInputChange}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="dSuklj12lkjsa0"
              value={formValues.password}
              onChange={handleInputChange}
            />
            <FieldDescription className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm font-semibold text-brand"
              >
                Forgot Password?
              </Link>
            </FieldDescription>
          </Field>

          {loginMessage.type && (
            <Alert variant={loginMessage.type}>
              {loginMessage.type === "success" && (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {loginMessage.type === "error" && <CircleX className="h-4 w-4" />}

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
    </Card>
  );
}
