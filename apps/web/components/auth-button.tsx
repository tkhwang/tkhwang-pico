"use client";

import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";

export function AuthButton() {
  const { user } = useUser();

  return (
    <>
      <SignedIn>
        <div className="flex items-center gap-4">
          Hey, {user?.emailAddresses[0]?.emailAddress || user?.firstName || 'there'}!
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8"
              }
            }}
          />
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex gap-2">
          <SignInButton mode="modal">
            <Button size="sm" variant="outline">
              Sign in
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="sm" variant="default">
              Sign up
            </Button>
          </SignUpButton>
        </div>
      </SignedOut>
    </>
  );
}
