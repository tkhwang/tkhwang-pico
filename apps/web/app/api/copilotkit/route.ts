import { MastraAgent } from "@ag-ui/mastra";
import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
  ExperimentalEmptyAdapter,
} from "@copilotkit/runtime";
import { MastraClient } from "@mastra/client-js";
import { type NextRequest } from "next/server";

import { getConfig } from "@/lib/config";

const serviceAdapter = new ExperimentalEmptyAdapter();

let runtimePromise: Promise<CopilotRuntime> | null = null;

async function initRuntime(): Promise<CopilotRuntime> {
  const { mastra } = getConfig();
  const agents = await MastraAgent.getRemoteAgents({
    mastraClient: new MastraClient({ baseUrl: mastra.mastraUrl }),
  });
  // @ts-expect-error - TODO: fix this
  return new CopilotRuntime({ agents });
}

function getRuntime(): Promise<CopilotRuntime> {
  if (!runtimePromise) {
    runtimePromise = initRuntime().catch((err) => {
      // Reset so subsequent requests can retry initialization
      runtimePromise = null;
      throw err;
    });
  }
  return runtimePromise;
}

// 4. Build a Next.js API route that handles the CopilotKit runtime requests.
export const POST = async (req: NextRequest) => {
  try {
    const runtime = await getRuntime();
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter,
      endpoint: "/api/copilotkit",
    });
    return handleRequest(req);
  } catch (err) {
    console.error("Failed to initialize CopilotRuntime:", err);
    return new Response("Copilot runtime initialization failed", {
      status: 500,
    });
  }
};
