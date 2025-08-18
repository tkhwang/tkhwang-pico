export const config = {
  common: {
    webUrl: process.env.NEXT_PUBLIC_WEB_URL,
  },
  mastra: {
    baseUrl: process.env.NEXT_PUBLIC_MASTRA_URL,
    copilotKitUrl: `${process.env.NEXT_PUBLIC_MASTRA_URL}/copilotkit`,
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
  },
} as const;

export const getCommonConfig = () => {
  const webUrl = config.common.webUrl;

  if (!webUrl) {
    throw new Error(
      "NEXT_PUBLIC_WEB_URL environment variable is not configured"
    );
  }

  return { webUrl };
};

export const getMastraConfig = () => {
  const baseUrl = config.mastra.baseUrl;

  if (!baseUrl) {
    throw new Error(
      "NEXT_PUBLIC_MASTRA_URL environment variable is not configured"
    );
  }

  return {
    baseUrl,
    copilotKitUrl: config.mastra.copilotKitUrl,
  };
};

export const getSupabaseConfig = () => {
  const { url, publishableKey } = config.supabase;

  if (!url || !publishableKey) {
    throw new Error("Supabase environment variables are not configured");
  }

  return { url, publishableKey };
};
