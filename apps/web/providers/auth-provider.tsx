"use client";

import { useAuth as useClerkAuth, useSession, useUser } from "@clerk/nextjs";
import { createContext, useContext, ReactNode } from "react";

interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

interface AuthContextValue {
  user: User | null;
  isLoaded: boolean;
  signOut: () => void;
  session: ReturnType<typeof useSession>["session"];
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerkAuth();
  const { session } = useSession();

  const user: User | null = clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        firstName: clerkUser.firstName || undefined,
        lastName: clerkUser.lastName || undefined,
        imageUrl: clerkUser.imageUrl || undefined,
      }
    : null;

  return (
    <AuthContext.Provider value={{ user, isLoaded, signOut, session }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
