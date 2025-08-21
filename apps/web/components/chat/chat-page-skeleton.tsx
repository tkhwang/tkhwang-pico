import { Skeleton } from "@/components/ui/skeleton";

export function ChatPageSkeleton() {
  return (
    <div className="h-full w-full max-w-3xl mx-auto p-4">
      <div className="flex flex-col gap-5">
        {/* user (right) */}
        <div className="flex justify-end">
          <div className="flex flex-col items-end gap-2 w-full max-w-[70%]">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>

        {/* ai (left) */}
        <div className="flex">
          <div className="flex flex-col items-start gap-2 w-full max-w-[70%]">
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>

        {/* user (right) */}
        <div className="flex justify-end">
          <div className="flex flex-col items-end gap-2 w-full max-w-[70%]">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>

        {/* ai (left) */}
        <div className="flex">
          <div className="flex flex-col items-start gap-2 w-full max-w-[70%]">
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </div>
    </div>
  );
}
