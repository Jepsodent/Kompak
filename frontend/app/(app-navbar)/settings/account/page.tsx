"use client";

import { Button } from "@/components/ui/button";

export default function AccountPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Change Password</h2>
        <p className="text-base max-w-[60ch]">
          Forgot your password? Don't worry, you can create a new one. As long
          as you have access to your email. We'll send a password reset link to
          your email.
        </p>
        <Button variant="secondary" className="cursor-pointer">
          Change Password
        </Button>
      </div>

      <div className="w-full space-y-2">
        <h2 className="text-xl font-bold">Change Email</h2>
        <p className="text-base max-w-[60ch]">
          Want to change your email? We got you covered! We'll send 2 to your
          old and new email. We'll change the email after you verify by clicking
          the link sent to those 2 emails.
        </p>
        <Button variant="secondary" className="cursor-pointer">
          Change Password
        </Button>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold">Delete Account</h2>
        <p className="text-base max-w-[60ch]">
          This is dangerous territory. When an account is deleted, all the data
          is permanently lost.
        </p>
        <Button variant="destructive" className="cursor-pointer">
          Delete Account
        </Button>
      </div>
    </div>
  );
}
