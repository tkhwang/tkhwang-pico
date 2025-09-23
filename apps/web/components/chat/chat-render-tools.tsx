"use client";

import { SquareCheckBig } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Spinner } from "@/components/ui/shadcn-io/spinner";

interface ChatGenericToolRenderProps {
  name: string;
  status: string;
  showElapsedSec?: boolean;
}

export function ChatGenericToolRender({
  name,
  status,
  showElapsedSec = false,
}: ChatGenericToolRenderProps) {
  const startTimeRef = useRef<number>(Date.now());
  const [elapsedSec, setElapsedSec] = useState<string>("");

  useEffect(() => {
    if (status === "complete" && showElapsedSec) {
      const elapsedMs = Date.now() - startTimeRef.current;
      setElapsedSec((elapsedMs / 1000).toFixed(1));
    }
  }, [status, showElapsedSec]);

  if (status !== "complete") {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Spinner className="h-3 w-3" />
        <span>{name}</span>
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-500">
      <SquareCheckBig className="size-4" /> <span>{name}</span>
      {showElapsedSec && elapsedSec ? (
        <span className="ml-1">{elapsedSec}s</span>
      ) : null}
    </div>
  );
}
