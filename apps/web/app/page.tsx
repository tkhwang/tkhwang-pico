"use client";

import { Assistant } from "@/app/assistant";
import HeroFormCenterAlignedSearchWithTags from "@/components/blocks/hero-forms/center-aligned-search-with-tags";
import { Navbar1 } from "@/components/navbar1";
import { useAuth } from "@/providers/auth-provider";

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <Navbar1 />
      {user ? <Assistant /> : <HeroFormCenterAlignedSearchWithTags />}
    </>
  );
}
