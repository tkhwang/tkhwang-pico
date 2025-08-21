import { generateGenericToolMessage } from "@/utils/tool-message";

interface ChatGenericToolRenderProps {
  name: string;
  status: string;
}

export function ChatGenericToolRender({
  name,
  status,
}: ChatGenericToolRenderProps) {
  const message = generateGenericToolMessage(name, status);
  return <p className="text-sm text-gray-500">{message}</p>;
}
