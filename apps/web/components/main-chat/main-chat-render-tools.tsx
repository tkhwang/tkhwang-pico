import { generateToolMessage } from "@/utils/tool-message";

interface CheckIntentToolRenderProps {
  status: string;
  args: { message?: string };
}

export function MainChatToolCheckIntent({
  status,
}: CheckIntentToolRenderProps) {
  const message = generateToolMessage(status, "🎯", "요청 의도 분석");
  return <p className="text-sm text-gray-500">{message}</p>;
}

interface DetectLanguageToolRenderProps {
  status: string;
  args: { message?: string };
  result?: { language?: "korean" | "english"; hasKorean?: boolean };
}

export function MainChatToolDetectLanguage({
  status,
  result,
}: DetectLanguageToolRenderProps) {
  if (status === "complete" && result?.language) {
    const languageText = result.language === "korean" ? "한국어" : "English";
    return (
      <p className="text-sm text-gray-500">🔍 언어 감지: {languageText}</p>
    );
  }

  const message = generateToolMessage(status, "🔍", "언어 감지");
  return <p className="text-sm text-gray-500">{message}</p>;
}

interface GenerateFallbackToolRenderProps {
  status: string;
  args: { language?: string };
}

export function MainChatToolGenerateFallback({
  status,
}: GenerateFallbackToolRenderProps) {
  const message = generateToolMessage(status, "💬", "응답 메시지 생성");
  return <p className="text-sm text-gray-500">{message}</p>;
}

interface HandleRequestToolRenderProps {
  status: string;
  args: { message?: string };
}

export function MainChatToolHandleRequest({
  status,
}: HandleRequestToolRenderProps) {
  const message = generateToolMessage(status, "⚙️", "유저 요청 처리");
  return <p className="text-sm text-gray-500">{message}</p>;
}

interface WeatherToolRenderProps {
  status: string;
  args: { location?: string };
}

export function MainChatToolWeather({ status }: WeatherToolRenderProps) {
  const message = generateToolMessage(status, "🌤️", "날씨 정보 조회");
  return <p className="text-sm text-gray-500">{message}</p>;
}
