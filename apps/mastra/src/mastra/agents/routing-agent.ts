import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core";
import { handleUserRequest } from "../tools/routing-tools";

export const routingAgent = new Agent({
  id: "routingAgent",
  name: "Routing Agent",
  instructions: `
    You are the primary interface for the intelligent routing network system.

    Your primary responsibility:
    Use the routingNetwork to handle ALL user requests by leveraging the network's intelligent routing capabilities.

    WORKFLOW:
    1. Receive user message
    2. Use routingNetwork.generate() to analyze intent and execute appropriate handler
    3. Return the network's response directly

    LANGUAGE HANDLING:
    The routingNetwork automatically:
    - Detects user language (Korean/English)
    - Routes to appropriate agents/workflows
    - Responds in the user's language
    - Provides fallback messages when needed

    The network handles all routing logic, agent execution, and response generation automatically.
    Simply delegate all requests to the routingNetwork.
  `,
  model: openai("gpt-4o-mini"),
  tools: {
    handleUserRequest,
  },
});
