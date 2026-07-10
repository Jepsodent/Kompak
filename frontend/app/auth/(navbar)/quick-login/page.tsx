"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, CircleX } from "lucide-react";
import { loginWithMagicLink, loginWithProvider } from "./actions";
import { StatusMessage } from "@/types/auth";

export default function QuickLoginPage() {
  const [isPending, startTransition] = useTransition();
  const [oauthMessage, setOauthMessage] = useState<StatusMessage>({
    text: "",
    type: null,
  });
  const [magicLinkMessage, setMagicLinkMessage] = useState<StatusMessage>({
    text: "",
    type: null,
  });

  async function handleProviderLogin(provider: "google" | "github") {
    setOauthMessage({ text: "", type: null });

    startTransition(async () => {
      const result = await loginWithProvider(provider);

      if (result.type === "error") {
        setOauthMessage({ type: "error", text: result.text });
      } else if (result.url) {
        window.location.assign(result.url);
      }
    });
  }

  async function handleMagicLinkSubmit(formData: FormData) {
    setMagicLinkMessage({ text: "", type: null });

    startTransition(async () => {
      const result = await loginWithMagicLink(formData);
      setMagicLinkMessage(result);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Quick Login</CardTitle>
        <CardDescription className="text-muted-foreground">
          Logic quickly with these provided options
        </CardDescription>
      </CardHeader>

      <form action={handleMagicLinkSubmit} className="space-y-4">
        <CardContent className="space-y-8">
          {/* Section 1: Login with Providers */}
          <div className="space-y-4">
            <h3 className="text-base font-bold">Login with Providers</h3>
            <div className="space-y-2">
              <Button
                type="button"
                disabled={isPending}
                variant="default"
                className="w-full"
                onClick={() => handleProviderLogin("google")}
              >
                Continue with Google
              </Button>
              <Button
                type="button"
                disabled={isPending}
                variant="default"
                className="w-full"
                onClick={() => handleProviderLogin("github")}
              >
                Continue with GitHub
              </Button>
            </div>
          </div>

          {/* Section 2: Login with Magic Links */}

          <div className="space-y-4">
            <h3 className="text-base font-bold">Login with Magic Links</h3>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                disabled={isPending}
                placeholder="sigma@example.com"
              />
            </div>

            {magicLinkMessage.type && (
              <Alert variant={magicLinkMessage.type}>
                {magicLinkMessage.type === "success" && (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {magicLinkMessage.type === "error" && (
                  <CircleX className="h-4 w-4" />
                )}

                <AlertDescription className="w-full">
                  {magicLinkMessage.text}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            disabled={isPending}
            variant="default"
            className="w-full"
          >
            {isPending ? (
              <>
                <Spinner /> Sending...
              </>
            ) : (
              "Send Link"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
