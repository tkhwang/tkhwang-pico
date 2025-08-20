import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { routingNetwork } from "../network/routing-network";

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
    handleUserRequest: createTool({
      id: "handleUserRequest",
      description: "Handle user requests using the intelligent routing network",
      inputSchema: z.object({
        message: z.string().describe("User message to process"),
      }),
      outputSchema: z.object({
        response: z.string().describe("Network response"),
        handler: z.string().optional().describe("Handler used"),
      }),
      execute: async ({ context }) => {
        try {
          // Use routingNetwork to intelligently handle the request
          const response = await routingNetwork.generate(
            [
              {
                role: "user",
                content: context.message,
              },
            ],
            {}
          );

          return {
            response: response.result || "응답을 생성할 수 없습니다.",
            handler: response.resourceId || "unknown",
          };
        } catch (error) {
          // Fallback error handling
          const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(context.message || "");

          const fallbackResponse = hasKorean
            ? `죄송합니다. 요청을 처리하는 중 오류가 발생했습니다. 다시 시도해 주세요.`
            : `I'm sorry, there was an error processing your request. Please try again.`;

          return {
            response: fallbackResponse,
            handler: "fallback",
          };
        }
      },
    }),
  },
});
