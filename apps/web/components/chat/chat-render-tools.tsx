import { useToolMessage } from "@/hooks/use-tool-message";

interface ChatGenericToolRenderProps {
  name: string;
  status: string;
  showElapsedSec?: boolean;
}

export function ChatGenericToolRender({
  name,
  status,
  showElapsedSec = false,
}: ChatGenericToolRenderProps) {
  const message = useToolMessage(name, status, showElapsedSec);
  return <p className="text-sm text-gray-500">{message}</p>;
}
