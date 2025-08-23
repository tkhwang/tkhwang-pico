"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ComponentType } from "react";
type ReactQueryDevtoolsProps = {
  buttonPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient instance for each component mount
  // This prevents sharing state between different app instances
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      })
  );

  // Lazily load React Query Devtools only in development
  const [Devtools, setDevtools] =
    useState<ComponentType<ReactQueryDevtoolsProps> | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      import("@tanstack/react-query-devtools")
        .then((mod) => {
          setDevtools(
            () =>
              mod.ReactQueryDevtools as ComponentType<ReactQueryDevtoolsProps>
          );
        })
        .catch(() => {
          // No-op: devtools are optional in development
        });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {Devtools ? <Devtools buttonPosition="top-right" /> : null}
    </QueryClientProvider>
  );
}
