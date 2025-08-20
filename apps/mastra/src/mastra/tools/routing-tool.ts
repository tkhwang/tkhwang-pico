import { createTool } from "@mastra/core";
import z from "zod";

interface RoutingAnalysis {
  intent: string;
  domain: string;
  confidence: number;
  suggestedHandler: string | null;
  fallbackMessage: string | null;
}

export const routingTool = createTool({
  id: "routingTool",
  description: "A tool for routing users to the appropriate agent or workflow",
  inputSchema: z.object({
    message: z.string().describe("The user message to analyze for routing"),
  }),
  outputSchema: z.object({
    intent: z.string().describe("The detected intent of the user"),
    domain: z
      .string()
      .describe("The domain category (weather, coding, general, etc.)"),
    confidence: z
      .number()
      .min(0)
      .max(1)
      .describe("Confidence score for the routing decision"),
    suggestedHandler: z
      .string()
      .nullable()
      .describe("Recommended agent or workflow ID"),
    fallbackMessage: z
      .string()
      .nullable()
      .describe("Message to show when no suitable handler found"),
    availableOptions: z
      .array(z.string())
      .describe("List of available agents and workflows"),
  }),
  execute: async ({ context }) => {
    return analyzePromptForRouting(context.message);
  },
});

const analyzePromptForRouting = async (
  userPrompt: string
): Promise<RoutingAnalysis & { availableOptions: string[] }> => {
  const prompt = userPrompt.toLowerCase();

  // Detect language (simple heuristic: if contains Korean characters, assume Korean)
  const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(userPrompt);
  const language = hasKorean ? "ko" : "en";

  // Available agents and workflows (multilingual)
  const availableOptions =
    language === "ko"
      ? [
          "날씨 정보 및 예보 (weatherAgent)",
          "날씨 기반 활동 계획 (weatherWorkflow)",
        ]
      : [
          "Weather information and forecasts (weatherAgent)",
          "Activity planning based on weather (weatherWorkflow)",
        ];

  // Weather-related intent detection (English + Korean)
  const weatherKeywords = [
    // English keywords
    "weather",
    "temperature",
    "rain",
    "snow",
    "sunny",
    "cloudy",
    "forecast",
    "climate",
    "humidity",
    "wind",
    "storm",
    "precipitation",
    "degrees",
    "celsius",
    "fahrenheit",
    "hot",
    "cold",
    "warm",
    "cool",
    // Korean keywords
    "날씨",
    "기온",
    "온도",
    "비",
    "눈",
    "맑은",
    "흐린",
    "예보",
    "일기예보",
    "기후",
    "습도",
    "바람",
    "폭풍",
    "강수",
    "도씨",
    "섭씨",
    "화씨",
    "뜨거운",
    "차가운",
    "따뜻한",
    "시원한",
    "더운",
    "추운",
    "덥다",
    "춥다",
    "날씨정보",
    "기상정보",
    "미세먼지",
    "자외선",
    "태풍",
  ];

  // Activity planning intent detection (English + Korean)
  const activityKeywords = [
    // English keywords
    "activity",
    "activities",
    "plan",
    "do",
    "visit",
    "go",
    "outdoor",
    "indoor",
    "suggestions",
    "recommend",
    "what to do",
    "things to do",
    "entertainment",
    "fun",
    "weekend",
    "today",
    "tomorrow",
    // Korean keywords
    "활동",
    "액티비티",
    "계획",
    "하다",
    "방문",
    "가다",
    "야외",
    "실외",
    "실내",
    "제안",
    "추천",
    "뭐할까",
    "무엇을",
    "놀거리",
    "재미",
    "주말",
    "오늘",
    "내일",
    "여행",
    "나들이",
    "데이트",
    "할일",
    "놀이",
    "레저",
    "스포츠",
    "산책",
    "운동",
  ];

  // Check for weather-related queries
  const weatherMatches = weatherKeywords.filter((keyword) =>
    prompt.includes(keyword)
  );
  const activityMatches = activityKeywords.filter((keyword) =>
    prompt.includes(keyword)
  );

  let intent = "unknown";
  let domain = "general";
  let confidence = 0;
  let suggestedHandler: string | null = null;
  let fallbackMessage: string | null = null;

  if (weatherMatches.length > 0) {
    intent = "weather_inquiry";
    domain = "weather";
    confidence = Math.min(weatherMatches.length * 0.3, 0.9);
    suggestedHandler = "weatherAgent";
  } else if (activityMatches.length > 0 && weatherMatches.length === 0) {
    // Activity planning without weather context - suggest workflow
    intent = "activity_planning";
    domain = "planning";
    confidence = Math.min(activityMatches.length * 0.25, 0.8);
    suggestedHandler = "weatherWorkflow";
  } else if (activityMatches.length > 0 && weatherMatches.length > 0) {
    // Both activity and weather mentioned - workflow is better
    intent = "weather_based_activity_planning";
    domain = "weather_planning";
    confidence = Math.min(
      (activityMatches.length + weatherMatches.length) * 0.2,
      0.9
    );
    suggestedHandler = "weatherWorkflow";
  } else {
    // No clear match found
    intent = "general_inquiry";
    domain = "general";
    confidence = 0.1;
    suggestedHandler = null;

    fallbackMessage =
      language === "ko"
        ? `죄송하지만, 귀하의 요청을 처리할 수 있는 전문 에이전트나 워크플로우가 없습니다.

현재 다음과 같은 도움을 드릴 수 있습니다:
• 모든 지역의 날씨 정보 및 예보
• 날씨 조건에 기반한 활동 계획 및 제안

사용 가능한 기능:
${availableOptions.map((option) => `• ${option}`).join("\n")}

이러한 기능 중 하나에 맞게 요청을 다시 표현해 주시거나, 날씨/활동에 대해 문의해 주세요.`
        : `I'm sorry, but I don't have a specialized agent or workflow to handle your request. 

Currently, I can help you with:
• Weather information and forecasts for any location
• Activity planning and suggestions based on weather conditions

Available capabilities:
${availableOptions.map((option) => `• ${option}`).join("\n")}

Please rephrase your request to match one of these capabilities, or ask about weather/activities.`;
  }

  return {
    intent,
    domain,
    confidence,
    suggestedHandler,
    fallbackMessage,
    availableOptions,
  };
};
