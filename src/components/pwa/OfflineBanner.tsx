"use client";

import { WifiOff } from "lucide-react";
import { useHydrated } from "@/hooks/useClientOnly";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OfflineBanner() {
  const hydrated = useHydrated();
  const isOnline = useOnlineStatus();

  if (!hydrated || isOnline) {
    return null;
  }

  return (
    <div
      className="sticky top-0 z-40 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950"
      role="status"
    >
      <WifiOff className="size-4" aria-hidden="true" />
      오프라인 모드 — 저장된 데이터로 계속 사용할 수 있습니다.
    </div>
  );
}
