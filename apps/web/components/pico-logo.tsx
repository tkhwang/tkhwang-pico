import { Bot } from "lucide-react";
import React from "react";
import Link from "next/link";

export const PicoLogo = () => {
  return (
    <>
      <Link
        href="/"
        className="flex items-center gap-2 self-center font-medium w-full justify-start group-data-[collapsible=icon]:justify-center"
      >
        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
          <Bot className="size-4" />
        </div>
        <span className="group-data-[collapsible=icon]:hidden">PICO</span>
      </Link>
    </>
  );
};
