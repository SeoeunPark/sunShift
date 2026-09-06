"use client";

import { useCallback } from "react";
import { useActiveUserId } from "@/hooks/useActiveUserId";
import { runSync } from "@/lib/sync";
import { isLocalUser } from "@/lib/repositories/getUserId";
import { useSyncStore } from "@/stores/syncStore";

export function useSyncActions() {
  const userId = useActiveUserId();
  const applySyncProgress = useSyncStore((state) => state.applySyncProgress);

  const triggerSync = useCallback(async () => {
    if (isLocalUser(userId)) {
      applySyncProgress({ status: "idle", pendingCount: 0, lastError: null });
      return;
    }

    await runSync(userId, applySyncProgress);
  }, [applySyncProgress, userId]);

  return { triggerSync };
}
