import { generateToolMessage } from "@/utils/tool-message";

interface DetectLanguageToolRenderProps {
  status: string;
  args: { message?: string };
  result?: { language?: "korean" | "english"; hasKorean?: boolean };
}

export function MainChatToolDetectLanguage({ status, result }: DetectLanguageToolRenderProps) {
  if (status === "complete" && result?.language) {
    const languageText = result.language === "korean" ? "한국어" : "English";
    return <p className="text-sm text-gray-500">🔍 언어 감지: {languageText}</p>;
  }
  
  const message = generateToolMessage(status, "🔍", "언어 감지");
  return <p className="text-sm text-gray-500">{message}</p>;
}