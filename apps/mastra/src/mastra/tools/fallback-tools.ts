import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { AVAILABLE_CAPABILITIES } from "../capabilities/available-capabilities";

function generateMessage(locale: "ko" | "en", capabilityList: string): string {
  if (locale === "ko") {
    return `PICO는 일반적인 요청에 대해서 응답을 하는 것이 아니라 특별히 훈련하여 추가한 에이전트를 이용한 기능에 기초로 답변을 합니다.

현재 사용 가능한 특화 기능:
${capabilityList}

위 특화 기능들과 관련된 질문을 해주시면 도움을 드릴 수 있습니다.`;
  }

  return `PICO doesn't respond to general requests, but rather provides answers based on specially trained and added agent-based capabilities.

Currently available specialized capabilities:
${capabilityList}

Please ask about the above specialized capabilities, and I'll be happy to help.`;
}

const detectLanguage = createTool({
  id: "detectLanguage",
  description: "Detect if the user message contains Korean characters",
  inputSchema: z.object({
    message: z.string().describe("User message to analyze"),
  }),
  outputSchema: z.object({
    language: z.enum(["korean", "english"]).describe("Detected language"),
    hasKorean: z.boolean().describe("Whether Korean characters were found"),
  }),
  execute: async ({ context }) => {
    const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(context.message);
    return {
      language: hasKorean ? ("korean" as const) : ("english" as const),
      hasKorean,
    };
  },
});

const generateFallbackMessage = createTool({
  id: "generateFallbackMessage",
  description: "Generate appropriate fallback message based on language",
  inputSchema: z.object({
    language: z
      .enum(["korean", "english"])
      .describe("Target language for response"),
  }),
  outputSchema: z.object({
    message: z.string().describe("Formatted fallback message"),
  }),
  execute: async ({ context }) => {
    const { language } = context;

    const locale = language === "korean" ? "ko" : "en";
    const capabilityList = AVAILABLE_CAPABILITIES.map(
      (capability) => `• ${capability.description[locale]} (${capability.name})`
    ).join("\n");

    const message = generateMessage(locale, capabilityList);

    return { message };
  },
});

export { detectLanguage, generateFallbackMessage };
