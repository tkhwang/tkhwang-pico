import { generateToolMessage } from "@/utils/tool-message";

interface CheckIntentToolRenderProps {
  status: string;
}

export function ChatToolCheckIntent({ status }: CheckIntentToolRenderProps) {
  const message = generateToolMessage(status, "🎯", "Analyzing request intent");
  return <p className="text-sm text-gray-500">{message}</p>;
}

interface DetectLanguageToolRenderProps {
  status: string;
  result?: { language?: "korean" | "english"; hasKorean?: boolean };
}

export function ChatToolDetectLanguage({
  status,
}: DetectLanguageToolRenderProps) {
  const message = generateToolMessage(status, "🔍", "Detecting language");
  return <p className="text-sm text-gray-500">{message}</p>;
}

interface GenerateFallbackToolRenderProps {
  status: string;
}

export function ChatToolGenerateFallback({
  status,
}: GenerateFallbackToolRenderProps) {
  const message = generateToolMessage(status, "💬", "Generating response");
  return <p className="text-sm text-gray-500">{message}</p>;
}

interface HandleRequestToolRenderProps {
  status: string;
}

export function ChatToolHandleRequest({
  status,
}: HandleRequestToolRenderProps) {
  const message = generateToolMessage(status, "⚙️", "Processing request");
  return <p className="text-sm text-gray-500">{message}</p>;
}

interface WeatherToolRenderProps {
  status: string;
}

export function ChatToolWeather({ status }: WeatherToolRenderProps) {
  const message = generateToolMessage(status, "🌤️", "Fetching weather");
  return <p className="text-sm text-gray-500">{message}</p>;
}
