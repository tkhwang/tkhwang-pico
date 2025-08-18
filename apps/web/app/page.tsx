"use client";

import HeroFormCenterAlignedSearchWithTags from "@/components/blocks/hero-forms/center-aligned-search-with-tags";
import { CopilotKitComponent } from "@/components/copilotkit-component";
import { getConfig } from "@/lib/config";
import { useAuth } from "@/providers/auth-provider";

export default function Home() {
  const { user } = useAuth();

  const copilotKitUrl = getConfig().mastra.copilotKitUrl;

  return (
    <>
      {user ? (
        <CopilotKitComponent runtimeUrl={copilotKitUrl} />
      ) : (
        <HeroFormCenterAlignedSearchWithTags />
      )}
    </>
  );
}
