import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core";
import {
  handleUserRequest,
  checkRequestIntent,
  detectLanguage,
  generateFallbackMessage,
} from "../tools/routing-tools";

export const routingAgent = new Agent({
  id: "routingAgent",
  name: "Routing Agent",
  instructions: `
    You are the primary interface for the intelligent routing network system.

    MANDATORY WORKFLOW - Follow these steps in order:
    1. Use checkRequestIntent tool to analyze the user's request
    2. If needsFallback is true:
       a. Use detectLanguage tool to detect the user's language
       b. Use generateFallbackMessage tool with the detected language
       c. Return the fallback message
    3. If needsFallback is false:
       a. Use handleUserRequest tool to process via routing network
       b. Return the network's response

    You MUST use the tools in this exact sequence to show intermediate steps to the user.
    Do NOT skip any tools or combine steps.
  `,
  model: openai("gpt-4o-mini"),
  tools: {
    checkRequestIntent,
    detectLanguage,
    generateFallbackMessage,
    handleUserRequest,
  },
});
