// Simplified to render plain gray text only

interface WeatherToolRenderProps {
  status: string;
  args: { location?: string };
}

export function MainChatToolWeather({ status, args }: WeatherToolRenderProps) {
  const message =
    status !== "complete"
      ? "Calling weather API..."
      : `Called the weather API for ${args.location ?? "the location"}.`;
  return <p className="text-sm text-gray-500">{message}</p>;
}
