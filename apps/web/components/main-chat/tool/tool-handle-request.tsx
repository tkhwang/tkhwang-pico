interface HandleRequestToolRenderProps {
  status: string;
  args: { message?: string };
}

export function MainChatToolHandleRequest({ status }: HandleRequestToolRenderProps) {
  const message =
    status !== "complete"
      ? "⚙️ 라우팅 네트워크 처리 중..."
      : "라우팅 네트워크 처리 완료";
  return <p className="text-sm text-gray-500">{message}</p>;
}