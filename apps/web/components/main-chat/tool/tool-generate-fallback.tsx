interface GenerateFallbackToolRenderProps {
  status: string;
  args: { language?: string };
}

export function MainChatToolGenerateFallback({ status }: GenerateFallbackToolRenderProps) {
  const message =
    status !== "complete"
      ? "💬 응답 메시지 생성 중..."
      : "응답 메시지 생성 완료";
  return <p className="text-sm text-gray-500">{message}</p>;
}