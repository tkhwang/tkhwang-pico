import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core";

import {
  checkRequestIntent,
  detectLanguage,
  generateFallbackMessage,
  handleUserRequest,
} from "../tools/routing-tools";
import { weatherTool } from "../tools/weather-tool";

export const routingAgent = new Agent({
  id: "routingAgent",
  name: "Routing Agent",
  instructions: `
    You are the primary interface for the intelligent routing network system.

    MANDATORY WORKFLOW - Follow these steps in order:
    1. Use checkRequestIntent tool to analyze the user's request
    2. If isWeatherRelated is true:
       a. Use weatherTool to get weather information
       b. Return the weather response (DO NOT call handleUserRequest)
    3. If needsFallback is true:
       a. Use detectLanguage tool to detect the user's language
       b. Use generateFallbackMessage tool with the detected language
       c. Return the fallback message (DO NOT call handleUserRequest)
    4. If needsFallback is false AND isWeatherRelated is false:
       a. Use handleUserRequest tool to process via routing network
       b. Return the network's response

    You MUST use the tools in this exact sequence to show intermediate steps to the user.
    Do NOT skip any tools or combine steps.
    IMPORTANT: Only call handleUserRequest for non-weather, non-fallback requests.
  `,
  model: openai("gpt-4o-mini"),
  tools: {
    checkRequestIntent,
    detectLanguage,
    generateFallbackMessage,
    handleUserRequest,
    weatherTool,
  },
});
