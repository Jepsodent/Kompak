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
import { sendPasswordResetLink } from "./actions";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [alertMessage, setAlertMessage] = useState<StatusMessage>({
    type: null,
    text: "",
  });
  const [email, setEmail] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSendPasswordResetLink = async (formData: FormData) => {
    setAlertMessage({ type: null, text: "" });

    startTransition(async () => {
      const result = await sendPasswordResetLink(formData);
      setAlertMessage(result);

      if (result.type === "success") {
        setEmail("");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot Password?</CardTitle>
        <CardDescription>
          Passwords are annoying aren't they? Fill the form below and we'll send
          you a link to reset them
        </CardDescription>
      </CardHeader>

      <form action={handleSendPasswordResetLink}>
        <CardContent className="mb-4 space-y-4">
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="sigma@example.com"
              value={email}
              onChange={handleInputChange}
            />
          </Field>

          {alertMessage.type && (
            <Alert variant={alertMessage.type}>
              {alertMessage.type === "success" && (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {alertMessage.type === "error" && <CircleX className="h-4 w-4" />}

              <AlertDescription className="w-full">
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
            className="w-full"
          >
            Send Link
          </Button>
          <Link href="/auth/login">Back to login</Link>
        </CardFooter>
      </form>
    </Card>
  );
}
