import { WrenchIcon } from "lucide-react";

interface WeatherToolRenderProps {
  status: string;
  args: { location?: string };
}

export function MainChatToolWeather({ status, args }: WeatherToolRenderProps) {
  return (
    <div className="flex items-center gap-2 my-3 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-lg">
      <div className="flex items-center gap-2">
        {status !== "complete" && (
          <>
            <div className="animate-pulse h-1.5 w-1.5 bg-blue-400 rounded-full"></div>
            <WrenchIcon className="h-3 w-3 text-gray-400 dark:text-gray-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400 italic">
              Calling weather API...
            </span>
          </>
        )}
        {status === "complete" && (
          <>
            <WrenchIcon className="h-3 w-3 text-gray-400 dark:text-gray-500" />
            <span className="text-xs text-gray-400 dark:text-gray-500 italic">
              Called the weather API for {args.location}.
            </span>
          </>
        )}
      </div>
    </div>
  );
}
