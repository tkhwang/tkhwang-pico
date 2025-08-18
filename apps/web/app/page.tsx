"use client";

import HeroFormCenterAlignedSearchWithTags from "@/components/blocks/hero-forms/center-aligned-search-with-tags";
import { MainChat } from "@/components/main-chat/main-chat";
import { useAuth } from "@/providers/auth-provider";

export default function Home() {
  const { user } = useAuth();

  return <>{user ? <MainChat /> : <HeroFormCenterAlignedSearchWithTags />}</>;
}
