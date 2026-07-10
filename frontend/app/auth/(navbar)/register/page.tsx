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
import { StatusMessage } from "@/types/auth";
import { CheckCircle2, CircleX } from "lucide-react";
import { useState, useTransition } from "react";
import { registerWithEmail } from "./actions";

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition();
  const [registerMessage, setRegisterMessage] = useState<StatusMessage>({
    text: "",
    type: null,
  });
  const [formValues, setFormValues] = useState({
    username: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (formData: FormData) => {
    setRegisterMessage({ text: "", type: null });

    startTransition(async () => {
      const result = await registerWithEmail(formData);
      setRegisterMessage(result);

      if (result.type === "success") {
        setFormValues({
          username: "",
          email: "",
          password: "",
          passwordConfirmation: "",
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register a New Account</CardTitle>
        <CardDescription>
          Now account yet? No worries, just fill the inputs below
        </CardDescription>
      </CardHeader>

      <form action={handleRegister}>
        <CardContent className="space-y-4">
          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              name="username"
              type="text"
              required
              placeholder="GoodGuyDonnie86"
              value={formValues.username}
              onChange={handleInputChange}
            />
          </Field>

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
          </Field>

          <Field>
            <FieldLabel htmlFor="passwordConfirmation">
              Password Confirmation
            </FieldLabel>
            <Input
              id="passwordConfirmation"
              name="passwordConfirmation"
              type="password"
              required
              placeholder="dSuklj12lkjsa0"
              value={formValues.passwordConfirmation}
              onChange={handleInputChange}
            />
            <FieldDescription>
              Make sure the password confirmation matches with your password!
            </FieldDescription>
          </Field>

          {registerMessage.type && (
            <Alert variant={registerMessage.type}>
              {registerMessage.type === "success" && (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {registerMessage.type === "error" && (
                <CircleX className="h-4 w-4" />
              )}

              <AlertDescription className="w-full">
                {registerMessage.text}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            disabled={isPending}
            variant="default"
            className="w-full"
          >
            Register
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
