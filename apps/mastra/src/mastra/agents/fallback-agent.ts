import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core";
import { detectLanguage, generateFallbackMessage } from "../tools/fallback-tools";

export const fallbackAgent = new Agent({
  id: "fallbackAgent",
  name: "Fallback Agent",
  instructions: `
    You are a fallback agent that handles requests when no other specialized agent can process them.

    Your responsibilities:
    1. Detect the user's language (Korean or English)
    2. Generate appropriate fallback messages explaining available capabilities
    3. Provide helpful guidance about what types of requests can be handled

    Always respond politely and helpfully, explaining what services are available.
  `,
  model: openai("gpt-4o-mini"),
  tools: {
    detectLanguage,
    generateFallbackMessage,
  },
});
