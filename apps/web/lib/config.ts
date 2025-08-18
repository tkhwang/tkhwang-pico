const config = {
  common: {
    webUrl: process.env.NEXT_PUBLIC_WEB_URL,
  },
  mastra: {
    mastraUrl: process.env.NEXT_PUBLIC_MASTRA_URL,
    copilotKitUrl: "/api/copilotkit",
  },
  supabase: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
  },
  copilotKit: {
    publicLicenseKey: process.env.NEXT_PUBLIC_COPILOTKIT_LICENSE_KEY,
  },
} as const;

// Unified config getter with validation
export const getConfig = () => {
  const { common, mastra, supabase, copilotKit } = config;

  // Validate required environment variables
  if (!common.webUrl) {
    throw new Error(
      "NEXT_PUBLIC_WEB_URL environment variable is not configured"
    );
  }

  if (!mastra.mastraUrl) {
    throw new Error(
      "NEXT_PUBLIC_MASTRA_URL environment variable is not configured"
    );
  }

  if (!supabase.supabaseUrl || !supabase.publishableKey) {
    throw new Error("Supabase environment variables are not configured");
  }

  if (!copilotKit.publicLicenseKey) {
    throw new Error(
      "NEXT_PUBLIC_COPILOTKIT_LICENSE_KEY environment variable is not configured"
    );
  }

  return {
    common: {
      webUrl: common.webUrl,
    },
    mastra: {
      mastraUrl: mastra.mastraUrl,
      copilotKitUrl: mastra.copilotKitUrl,
    },
    supabase: {
      supabaseUrl: supabase.supabaseUrl,
      publishableKey: supabase.publishableKey,
    },
    copilotKit: {
      publicLicenseKey: copilotKit.publicLicenseKey,
    },
  };
};
