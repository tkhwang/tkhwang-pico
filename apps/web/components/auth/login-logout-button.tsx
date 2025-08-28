"use client";

import React from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

export const LoginLogoutButton = () => {
  const router = useRouter();

  const { user, signOut } = useAuth();

  if (user) {
    return (
      <Button
        type="button"
        onClick={async () => {
          await signOut();
          // Align with the rest of the app's flow
          // (or router.refresh() if you rely on middleware/session refresh)
          router.push("/auth/login");
        }}
      >
        Log out
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={() => {
        router.push("/auth/login");
      }}
    >
      Login
    </Button>
  );
};
