"use client";

import { Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShareSchedule } from "@/hooks/useShareSchedule";
import type { ScheduleShareInput } from "@/lib/share/scheduleText";
import { cn } from "@/lib/utils";

interface ShareScheduleActionsProps {
  input: ScheduleShareInput;
  disabled?: boolean;
  compact?: boolean;
}

export function ShareScheduleActions({
  input,
  disabled = false,
  compact = false,
}: ShareScheduleActionsProps) {
  const { share, download, isSharing, message } = useShareSchedule();

  if (compact) {
    return (
      <section className="shrink-0 space-y-1">
        <div className="flex gap-1.5">
          <Button
            size="sm"
            className="h-8 flex-1 text-xs"
            onClick={() => void share(input)}
            disabled={disabled || isSharing}
          >
            <Share2 className="size-3.5" aria-hidden="true" />
            {isSharing ? "준비 중..." : "공유"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 flex-1 text-xs"
            onClick={() => void download(input)}
            disabled={disabled || isSharing}
          >
            <Download className="size-3.5" aria-hidden="true" />
            저장
          </Button>
        </div>
        {message && (
          <p className="text-center text-[10px] text-muted-foreground" role="status">
            {message}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className={cn("rounded-2xl border bg-card p-4 shadow-sm", compact && "shrink-0")}>
      <div className="mb-3">
        <h2 className="text-sm font-medium text-muted-foreground">근무표 공유</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          이번 달 근무표를 이미지 또는 텍스트로 공유할 수 있습니다.
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          className="flex-1"
          onClick={() => void share(input)}
          disabled={disabled || isSharing}
        >
          <Share2 className="size-4" aria-hidden="true" />
          {isSharing ? "준비 중..." : "공유하기"}
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => void download(input)}
          disabled={disabled || isSharing}
        >
          <Download className="size-4" aria-hidden="true" />
          이미지 저장
        </Button>
      </div>

      {message && (
        <p className="mt-3 text-sm text-muted-foreground" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
