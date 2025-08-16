"use client";

import React from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

export const LoginLogoutButton = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (user) {
    return (
      <Button
        onClick={() => {
          signOut();
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
        router.push("/login");
      }}
    >
      Login
    </Button>
  );
};
