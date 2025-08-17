"use client";

import HeroFormCenterAlignedSearchWithTags from "@/components/blocks/hero-forms/center-aligned-search-with-tags";
import { CopilotKitComponent } from "@/components/copilotkit-component";
import { useAuth } from "@/providers/auth-provider";
import { getMastraConfig } from "@/lib/config";

export default function Home() {
  const { user } = useAuth();

  let copilotKitUrl = "";
  try {
    const config = getMastraConfig();
    copilotKitUrl = config.copilotKitUrl;
  } catch (error) {
    console.error("Failed to get Mastra configuration:", error);
  }

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
