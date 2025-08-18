import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";

import { MastraAgent } from "@ag-ui/mastra";
import { MastraClient } from "@mastra/client-js";
import { NextRequest } from "next/server";
import { getConfig } from "@/lib/config";

const config = getConfig();

const serviceAdapter = new ExperimentalEmptyAdapter();

// 3. Create the CopilotRuntime instance and utilize the Mastra AG-UI
//    integration to get the remote agents.
const runtime = new CopilotRuntime({
  // @ts-expect-error - TODO: fix this
  agents: await MastraAgent.getRemoteAgents({
    mastraClient: new MastraClient({ baseUrl: config.mastra.mastraUrl }),
  }),
});

// 4. Build a Next.js API route that handles the CopilotKit runtime requests.
export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
