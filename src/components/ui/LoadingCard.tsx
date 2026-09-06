import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingCardProps {
  lines?: number;
  className?: string;
}

export function LoadingCard({ lines = 2, className }: LoadingCardProps) {
  return (
    <div className={cn("app-card p-6", className)} aria-busy="true" aria-label="불러오는 중">
      <Skeleton className="mb-4 h-4 w-24" />
      <div className="space-y-2">
        {Array.from({ length: lines }, (_, index) => (
          <Skeleton
            key={index}
            className={cn("h-4", index === lines - 1 ? "w-2/3" : "w-full")}
          />
        ))}
      </div>
    </div>
  );
}
