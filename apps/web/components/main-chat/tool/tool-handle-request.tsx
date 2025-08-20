import { generateToolMessage } from "@/utils/tool-message";

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
