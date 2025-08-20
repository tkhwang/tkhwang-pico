interface DetectLanguageToolRenderProps {
  status: string;
  args: { message?: string };
}

export function MainChatToolDetectLanguage({ status }: DetectLanguageToolRenderProps) {
  const message =
    status !== "complete"
      ? "🔍 언어 감지 중..."
      : "언어 감지 완료";
  return <p className="text-sm text-gray-500">{message}</p>;
}