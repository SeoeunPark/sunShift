import { create } from "zustand";
import type { SyncState, SyncStatusState } from "@/types/sync";

interface SyncStore extends SyncState {
  setStatus: (status: SyncStatusState) => void;
  setPendingCount: (pendingCount: number) => void;
  setLastSyncedAt: (lastSyncedAt: string | null) => void;
  setLastError: (lastError: string | null) => void;
  applySyncProgress: (progress: Partial<SyncState>) => void;
  reset: () => void;
}

const initialState: SyncState = {
  status: "idle",
  lastSyncedAt: null,
  pendingCount: 0,
  lastError: null,
};

export const useSyncStore = create<SyncStore>((set) => ({
  ...initialState,
  setStatus: (status) => set({ status }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
  setLastError: (lastError) => set({ lastError }),
  applySyncProgress: (progress) => set((state) => ({ ...state, ...progress })),
  reset: () => set(initialState),
}));

export function useSyncStatus() {
  const status = useSyncStore((state) => state.status);
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt);
  const pendingCount = useSyncStore((state) => state.pendingCount);
  const lastError = useSyncStore((state) => state.lastError);

  const label = getSyncStatusLabel(status, pendingCount);

  return {
    status,
    label,
    lastSyncedAt,
    pendingCount,
    lastError,
    isSyncing: status === "syncing",
    isOffline: status === "offline",
    needsSync: status === "pending" || pendingCount > 0,
  };
}

function getSyncStatusLabel(status: SyncStatusState, pendingCount: number): string {
  switch (status) {
    case "syncing":
      return "동기화 중...";
    case "synced":
      return "동기화 완료";
    case "offline":
      return "오프라인";
    case "pending":
      return pendingCount > 0 ? `동기화 필요 (${pendingCount})` : "동기화 필요";
    case "error":
      return "동기화 오류";
    default:
      return "로컬 사용 중";
  }
}
