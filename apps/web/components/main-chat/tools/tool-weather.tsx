import { generateToolMessage } from "@/utils/tool-message";

interface WeatherToolRenderProps {
  status: string;
  args: { location?: string };
}

export function MainChatToolWeather({ status, args }: WeatherToolRenderProps) {
  const message = generateToolMessage(status, "🌤️", "날씨 정보 조회");
  return <p className="text-sm text-gray-500">{message}</p>;
}
