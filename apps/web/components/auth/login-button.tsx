"use client";

import { useRouter } from "next/navigation";
import React from "react";

import { Button } from "../ui/button";

export const LoginButton = () => {
  const router = useRouter();

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
