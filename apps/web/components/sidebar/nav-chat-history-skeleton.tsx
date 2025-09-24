import { Skeleton } from '@/components/ui/skeleton';

export function NavChatHistorySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="px-2 py-1">
          <Skeleton
            className={`h-3 bg-gray-300 dark:bg-gray-600 ${
              index === 0
                ? 'w-3/5'
                : index === 1
                  ? 'w-4/5'
                  : index === 2
                    ? 'w-2/5'
                    : index === 3
                      ? 'w-3/4'
                      : 'w-1/2'
            }`}
          />
        </div>
      ))}
    </div>
  );
}
