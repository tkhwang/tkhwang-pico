import { registerCopilotKit } from "@ag-ui/mastra";
import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";
import { PinoLogger } from "@mastra/loggers";

import { fallbackAgent } from "./agents/fallback-agent";
import { routingAgent } from "./agents/routing-agent";
import { weatherAgent } from "./agents/weather-agent";
import { weatherWorkflow } from "./workflows/weather-workflow";

export const mastra = new Mastra({
  agents: { routingAgent, weatherAgent, fallbackAgent },
  workflows: { weatherWorkflow },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
  server: {
    cors: {
      origin: "*",
      allowMethods: ["*"],
      allowHeaders: ["*"],
    },
    apiRoutes: [
      registerCopilotKit({
        path: "/copilotkit",
        resourceId: "weatherAgent",
        setContext: (c, runtimeContext) => {
          runtimeContext.set(
            "user-id",
            c.req.header("X-User-ID") || "anonymous",
          );
          runtimeContext.set("temperature-scale", "celsius");
        },
      }),
    ],
  },
});
