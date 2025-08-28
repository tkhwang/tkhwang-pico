"use client";

import React from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

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
