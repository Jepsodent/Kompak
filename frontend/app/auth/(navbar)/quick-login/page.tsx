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
import { StatusMessage } from "@/types/auth";
import { loginWithMagicLink, loginWithProvider } from "../../actions";
import { Icons } from "@/components/ui/icons";

export default function QuickLoginPage() {
  const [isPending, startTransition] = useTransition();
  const [oauthAlertMessage, setOauthMessage] = useState<StatusMessage>({
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Quick Login</CardTitle>
        <CardDescription className="text-base">
          Login quickly with these provided options
        </CardDescription>
      </CardHeader>

      <form action={handleMagicLinkSubmit}>
        <CardContent className="space-y-8 mb-4">
          {/* Section 1: Login with Providers */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Login with Providers</h3>

            <div className="space-y-2">
              <Button
                type="button"
                disabled={isPending}
                variant="default"
                className="w-full cursor-pointer"
                onClick={() => handleProviderLogin("google")}
              >
                Continue with Google
                <Icons.google className="w-4 h-4" />
              </Button>

              <Button
                type="button"
                disabled={isPending}
                variant="default"
                className="w-full cursor-pointer"
                onClick={() => handleProviderLogin("github")}
              >
                Continue with GitHub <Icons.gitHub className="w-4 h-4" />
              </Button>
            </div>

            {oauthAlertMessage.type && (
              <Alert variant={oauthAlertMessage.type}>
                {oauthAlertMessage.type === "success" && (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {oauthAlertMessage.type === "error" && (
                  <CircleX className="h-4 w-4" />
                )}

                <AlertDescription className="text-sm">
                  {oauthAlertMessage.text}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Section 2: Login with Magic Links */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Login with Magic Links</h3>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">
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

                <AlertDescription className="text-sm">
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
            className="w-full cursor-pointer"
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
