"use client";

import { StatusMessage } from "@/types/auth.type";
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

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [alertMessage, setAlertMessage] = useState<StatusMessage>({
    type: null,
    text: "",
  });
  const [formValues, setFormValues] = useState({
    password: "",
    passwordConfirmation: "",
  });
  const [counter, setCounter] = useState(3);

  useEffect(() => {
    if (alertMessage.type !== "success") return;

    if (counter === 0) {
      router.push("/auth/login");
      return;
    }

    const timer = setTimeout(() => {
      setCounter((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [alertMessage.type, counter, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdatePassword = async (formData: FormData) => {
    setAlertMessage({ type: null, text: "" });

    startTransition(async () => {
      const result = await updatePassword(formData);
      setAlertMessage(result);

      if (result.type === "success") {
        setFormValues({
          password: "",
          passwordConfirmation: "",
        });
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

      <form action={handleUpdatePassword}>
        <CardContent className="space-y-4 mb-4">
          <Field>
            <FieldLabel htmlFor="password" className="text-sm">
              Password
            </FieldLabel>
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
            <FieldLabel htmlFor="passwordConfirmation" className="text-sm">
              Re-Type Password
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
              Make sure both password matches.
            </FieldDescription>
          </Field>

          {alertMessage.type && (
            <Alert variant={alertMessage.type}>
              {alertMessage.type === "success" && (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {alertMessage.type === "error" && <CircleX className="h-4 w-4" />}

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
    </Card>
  );
}
