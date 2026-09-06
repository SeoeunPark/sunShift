export type SyncEntity =
  | "shift_settings"
  | "leave_record"
  | "memo_record"
  | "notification_settings"
  | "sleep_settings";

export type SyncOperation = "upsert" | "delete";

export interface SyncQueueItem {
  id: string;
  userId: string;
  operation: SyncOperation;
  entity: SyncEntity;
  entityId: string;
  payload: string;
  createdAt: string;
  retryCount: number;
  lastError?: string;
}

export type SyncStatusState =
  | "idle"
  | "syncing"
  | "synced"
  | "offline"
  | "pending"
  | "error";

export interface SyncState {
  status: SyncStatusState;
  lastSyncedAt: string | null;
  pendingCount: number;
  lastError: string | null;
}

export const MAX_SYNC_RETRIES = 5;
