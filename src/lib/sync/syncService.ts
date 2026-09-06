import { nowIso } from "@/lib/db/mappers";
import { META_KEYS } from "@/lib/db/constants";
import { setMeta } from "@/lib/db/initLocalDb";
import {
  localLeaveStore,
  localMemoStore,
  localNotificationStore,
  localShiftSettingsStore,
  localSleepStore,
} from "@/lib/repositories/local";
import { isLocalUser } from "@/lib/repositories/getUserId";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type {
  LocalLeaveRecord,
  LocalMemoRecord,
  LocalNotificationSettings,
  LocalShiftSettings,
  LocalSleepSettings,
} from "@/types/local";
import { MAX_SYNC_RETRIES, type SyncStatusState } from "@/types/sync";
import { isBrowserOnline } from "./onlineStatus";
import {
  enqueuePendingLocalRecords,
  migrateLocalUserToAuthUser,
  pullAndMergeRemote,
} from "./syncPull";
import { pushQueueItem } from "./syncPush";
import { syncQueueStore } from "./syncQueueStore";

let activeSyncPromise: Promise<void> | null = null;

export type SyncProgressCallback = (state: {
  status: SyncStatusState;
  pendingCount: number;
  lastError: string | null;
  lastSyncedAt: string | null;
}) => void;

async function markLocalSynced(
  item: import("@/types/sync").SyncQueueItem,
): Promise<void> {
  switch (item.entity) {
    case "shift_settings": {
      const record = JSON.parse(item.payload) as LocalShiftSettings;
      await localShiftSettingsStore.put({ ...record, syncStatus: "synced" });
      break;
    }
    case "leave_record": {
      if (item.operation === "upsert") {
        const record = JSON.parse(item.payload) as LocalLeaveRecord;
        await localLeaveStore.put({ ...record, syncStatus: "synced" });
      }
      break;
    }
    case "memo_record": {
      if (item.operation === "upsert") {
        const record = JSON.parse(item.payload) as LocalMemoRecord;
        await localMemoStore.put({ ...record, syncStatus: "synced" });
      }
      break;
    }
    case "notification_settings": {
      const record = JSON.parse(item.payload) as LocalNotificationSettings;
      await localNotificationStore.put({ ...record, syncStatus: "synced" });
      break;
    }
    case "sleep_settings": {
      const record = JSON.parse(item.payload) as LocalSleepSettings;
      await localSleepStore.put({ ...record, syncStatus: "synced" });
      break;
    }
  }
}

export async function processQueue(userId: string): Promise<{
  success: boolean;
  pendingCount: number;
  lastError: string | null;
}> {
  if (isLocalUser(userId) || !isSupabaseConfigured() || !isBrowserOnline()) {
    const pendingCount = await syncQueueStore.countPending(userId);
    return { success: false, pendingCount, lastError: null };
  }

  const items = await syncQueueStore.getPending(userId);
  let lastError: string | null = null;

  for (const item of items) {
    if (item.retryCount >= MAX_SYNC_RETRIES) {
      lastError = item.lastError ?? "Maximum retry count exceeded";
      continue;
    }

    try {
      const ok = await pushQueueItem(item);
      if (ok) {
        await markLocalSynced(item);
        await syncQueueStore.remove(item.id);
      } else {
        const message = "Remote sync failed";
        await syncQueueStore.markFailed(item, message);
        lastError = message;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sync failed";
      await syncQueueStore.markFailed(item, message);
      lastError = message;
    }
  }

  const pendingCount = await syncQueueStore.countPending(userId);
  return { success: lastError === null, pendingCount, lastError };
}

export async function fullSync(
  userId: string,
  onProgress?: SyncProgressCallback,
): Promise<void> {
  if (isLocalUser(userId)) {
    onProgress?.({
      status: "idle",
      pendingCount: 0,
      lastError: null,
      lastSyncedAt: null,
    });
    return;
  }

  if (!isSupabaseConfigured()) {
    onProgress?.({
      status: "idle",
      pendingCount: 0,
      lastError: null,
      lastSyncedAt: null,
    });
    return;
  }

  if (!isBrowserOnline()) {
    const pendingCount = await syncQueueStore.countPending(userId);
    onProgress?.({
      status: "offline",
      pendingCount,
      lastError: null,
      lastSyncedAt: null,
    });
    return;
  }

  onProgress?.({
    status: "syncing",
    pendingCount: await syncQueueStore.countPending(userId),
    lastError: null,
    lastSyncedAt: null,
  });

  await enqueuePendingLocalRecords(userId);
  await pullAndMergeRemote(userId);
  const firstPass = await processQueue(userId);
  await pullAndMergeRemote(userId);
  const secondPass = await processQueue(userId);

  const pendingCount = secondPass.pendingCount;
  const lastError = secondPass.lastError ?? firstPass.lastError;
  const lastSyncedAt = lastError ? null : nowIso();

  if (lastSyncedAt) {
    await setMeta(`${META_KEYS.lastSyncedAt}:${userId}`, lastSyncedAt);
  }

  onProgress?.({
    status: !isBrowserOnline()
      ? "offline"
      : pendingCount > 0
        ? lastError
          ? "error"
          : "pending"
        : lastError
          ? "error"
          : "synced",
    pendingCount,
    lastError,
    lastSyncedAt,
  });
}

export async function runSync(userId: string, onProgress?: SyncProgressCallback): Promise<void> {
  if (activeSyncPromise) {
    return activeSyncPromise;
  }

  activeSyncPromise = fullSync(userId, onProgress).finally(() => {
    activeSyncPromise = null;
  });

  return activeSyncPromise;
}

export async function onLogin(authUserId: string, onProgress?: SyncProgressCallback): Promise<void> {
  await migrateLocalUserToAuthUser(authUserId);
  await enqueuePendingLocalRecords(authUserId);
  await runSync(authUserId, onProgress);
}

export async function enqueueSync(
  userId: string,
  input: Omit<import("./syncQueueStore").EnqueueSyncInput, "userId">,
): Promise<void> {
  if (isLocalUser(userId) || !isSupabaseConfigured()) {
    return;
  }

  await syncQueueStore.enqueue({ userId, ...input });

  if (isBrowserOnline()) {
    void runSync(userId);
  }
}

export { migrateLocalUserToAuthUser, pullAndMergeRemote, enqueuePendingLocalRecords };
