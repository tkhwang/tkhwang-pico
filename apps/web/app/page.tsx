"use client";

import { ChatAfterLogin } from "@/components/chat/chat-after-login";
import { ChatBeforeLogin } from "@/components/chat/chat-before-login";
import { useAuth } from "@/providers/auth-provider";

export default function Home() {
  const { user } = useAuth();

  return <>{user ? <ChatAfterLogin /> : <ChatBeforeLogin />}</>;
}
