import { generateToolMessage } from "@/utils/tool-message";

interface GenerateFallbackToolRenderProps {
  status: string;
  args: { language?: string };
}

export function MainChatToolGenerateFallback({ status }: GenerateFallbackToolRenderProps) {
  const message = generateToolMessage(status, "💬", "응답 메시지 생성");
  return <p className="text-sm text-gray-500">{message}</p>;
}