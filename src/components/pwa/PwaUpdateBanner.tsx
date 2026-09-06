"use client";

import { Button } from "@/components/ui/button";
import { BOTTOM_NAV_BANNER_OFFSET } from "@/lib/layout/viewport";
import { cn } from "@/lib/utils";

interface PwaUpdateBannerProps {
  onReload: () => void;
}

export function PwaUpdateBanner({ onReload }: PwaUpdateBannerProps) {
  return (
    <div className={cn("fixed inset-x-0 z-50 mx-auto max-w-lg px-4", BOTTOM_NAV_BANNER_OFFSET)}>
      <div className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-lg">
        <p className="text-sm">새 버전이 준비되었습니다.</p>
        <Button size="sm" onClick={onReload}>
          새로고침
        </Button>
      </div>
    </div>
  );
}
