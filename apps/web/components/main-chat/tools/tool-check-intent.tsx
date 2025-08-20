import { generateToolMessage } from "@/utils/tool-message";

interface CheckIntentToolRenderProps {
  status: string;
  args: { message?: string };
}

export function MainChatToolCheckIntent({ status }: CheckIntentToolRenderProps) {
  const message = generateToolMessage(status, "🎯", "요청 의도 분석");
  return <p className="text-sm text-gray-500">{message}</p>;
}