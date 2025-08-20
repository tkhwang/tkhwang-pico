interface CheckIntentToolRenderProps {
  status: string;
  args: { message?: string };
}

export function MainChatToolCheckIntent({ status }: CheckIntentToolRenderProps) {
  const message =
    status !== "complete"
      ? "🎯 요청 의도 분석 중..."
      : "요청 의도 분석 완료";
  return <p className="text-sm text-gray-500">{message}</p>;
}