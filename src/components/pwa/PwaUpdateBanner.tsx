"use client";

import { Button } from "@/components/ui/button";

interface PwaUpdateBannerProps {
  onReload: () => void;
}

export function PwaUpdateBanner({ onReload }: PwaUpdateBannerProps) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-lg px-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-lg">
        <p className="text-sm">새 버전이 준비되었습니다.</p>
        <Button size="sm" onClick={onReload}>
          새로고침
        </Button>
      </div>
    </div>
  );
}
