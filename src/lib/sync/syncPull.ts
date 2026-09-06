import { createId, nowIso } from "@/lib/db/mappers";
import { LOCAL_USER_ID } from "@/lib/db/constants";
import { hasShiftSettings } from "@/lib/db/initLocalDb";
import {
  getOnboardingCompleted,
  setOnboardingCompleted,
} from "@/lib/onboarding/onboardingStatus";
import {
  localLeaveStore,
  localMemoStore,
  localNotificationStore,
  localShiftSettingsStore,
  localSleepStore,
} from "@/lib/repositories/local";
import type { LocalLeaveRecord, LocalMemoRecord } from "@/types/local";
import { resolveLastWriteWins } from "./conflictResolver";
import { syncQueueStore } from "./syncQueueStore";
import {
  remoteLeaveStore,
  remoteMemoStore,
  remoteNotificationStore,
  remoteShiftSettingsStore,
  remoteSleepStore,
} from "@/lib/repositories/remote";

async function mergeShiftSettings(userId: string): Promise<void> {
  const [local, remote] = await Promise.all([
    localShiftSettingsStore.getByUserId(userId),
    remoteShiftSettingsStore.getByUserId(userId),
  ]);

  if (!remote && local) {
    await syncQueueStore.enqueue({
      userId,
      operation: "upsert",
      entity: "shift_settings",
      entityId: local.id,
      payload: local,
    });
    return;
  }

  if (remote && !local) {
    await localShiftSettingsStore.put({ ...remote, syncStatus: "synced" });
    return;
  }

  if (remote && local) {
    const { winner, source } = resolveLastWriteWins(local, remote);
    await localShiftSettingsStore.put({
      ...winner,
      syncStatus: source === "remote" ? "synced" : "pending",
    });

    if (source === "local") {
      await syncQueueStore.enqueue({
        userId,
        operation: "upsert",
        entity: "shift_settings",
        entityId: winner.id,
        payload: winner,
      });
    }
  }
}

async function mergeRecordsByDate<T extends LocalLeaveRecord | LocalMemoRecord>(
  userId: string,
  entity: "leave_record" | "memo_record",
  getLocalAll: (userId: string) => Promise<T[]>,
  getRemoteAll: (userId: string) => Promise<T[]>,
  putLocal: (record: T) => Promise<void>,
): Promise<void> {
  const [localRecords, remoteRecords] = await Promise.all([
    getLocalAll(userId),
    getRemoteAll(userId),
  ]);

  const localByDate = new Map(localRecords.map((record) => [record.date, record]));
  const remoteByDate = new Map(remoteRecords.map((record) => [record.date, record]));
  const allDates = new Set([...localByDate.keys(), ...remoteByDate.keys()]);

  for (const date of allDates) {
    const local = localByDate.get(date);
    const remote = remoteByDate.get(date);

    if (local && !remote) {
      await putLocal({ ...local, syncStatus: "pending" });
      await syncQueueStore.enqueue({
        userId,
        operation: "upsert",
        entity,
        entityId: local.id,
        payload: local,
      });
      continue;
    }

    if (!local && remote) {
      await putLocal({ ...remote, syncStatus: "synced" });
      continue;
    }

    if (local && remote) {
      const { winner, source } = resolveLastWriteWins(local, remote);
      await putLocal({
        ...winner,
        syncStatus: source === "remote" ? "synced" : "pending",
      });

      if (source === "local") {
        await syncQueueStore.enqueue({
          userId,
          operation: "upsert",
          entity,
          entityId: winner.id,
          payload: winner,
        });
      }
    }
  }
}

async function mergeNotificationSettings(userId: string): Promise<void> {
  const [local, remote] = await Promise.all([
    localNotificationStore.getByUserId(userId),
    remoteNotificationStore.getByUserId(userId),
  ]);

  if (!remote && local) {
    await syncQueueStore.enqueue({
      userId,
      operation: "upsert",
      entity: "notification_settings",
      entityId: local.id,
      payload: local,
    });
    return;
  }

  if (remote && !local) {
    await localNotificationStore.put({ ...remote, syncStatus: "synced" });
    return;
  }

  if (remote && local) {
    const { winner, source } = resolveLastWriteWins(local, remote);
    await localNotificationStore.put({
      ...winner,
      syncStatus: source === "remote" ? "synced" : "pending",
    });

    if (source === "local") {
      await syncQueueStore.enqueue({
        userId,
        operation: "upsert",
        entity: "notification_settings",
        entityId: winner.id,
        payload: winner,
      });
    }
  }
}

async function mergeSleepSettings(userId: string): Promise<void> {
  const [localRecords, remoteRecords] = await Promise.all([
    localSleepStore.getAll(userId),
    remoteSleepStore.getAll(userId),
  ]);

  const localByCode = new Map(localRecords.map((record) => [record.shiftCode, record]));
  const remoteByCode = new Map(remoteRecords.map((record) => [record.shiftCode, record]));
  const allCodes = new Set([...localByCode.keys(), ...remoteByCode.keys()]);

  for (const shiftCode of allCodes) {
    const local = localByCode.get(shiftCode);
    const remote = remoteByCode.get(shiftCode);

    if (local && !remote) {
      await localSleepStore.put({ ...local, syncStatus: "pending" });
      await syncQueueStore.enqueue({
        userId,
        operation: "upsert",
        entity: "sleep_settings",
        entityId: local.id,
        payload: local,
      });
      continue;
    }

    if (!local && remote) {
      await localSleepStore.put({ ...remote, syncStatus: "synced" });
      continue;
    }

    if (local && remote) {
      const { winner, source } = resolveLastWriteWins(local, remote);
      await localSleepStore.put({
        ...winner,
        syncStatus: source === "remote" ? "synced" : "pending",
      });

      if (source === "local") {
        await syncQueueStore.enqueue({
          userId,
          operation: "upsert",
          entity: "sleep_settings",
          entityId: winner.id,
          payload: winner,
        });
      }
    }
  }
}

export async function pullAndMergeRemote(userId: string): Promise<void> {
  await mergeShiftSettings(userId);

  await mergeRecordsByDate<LocalLeaveRecord>(
    userId,
    "leave_record",
    localLeaveStore.getAll.bind(localLeaveStore),
    remoteLeaveStore.getAll.bind(remoteLeaveStore),
    localLeaveStore.put.bind(localLeaveStore),
  );

  await mergeRecordsByDate<LocalMemoRecord>(
    userId,
    "memo_record",
    localMemoStore.getAll.bind(localMemoStore),
    remoteMemoStore.getAll.bind(remoteMemoStore),
    localMemoStore.put.bind(localMemoStore),
  );

  await mergeNotificationSettings(userId);
  await mergeSleepSettings(userId);
}

/** Copy anonymous local data to authenticated user on first login */
export async function migrateLocalUserToAuthUser(authUserId: string): Promise<void> {
  if (authUserId === LOCAL_USER_ID) {
    return;
  }

  const localHasData = await hasShiftSettings(LOCAL_USER_ID);
  if (!localHasData) {
    return;
  }

  const authHasData = await hasShiftSettings(authUserId);
  const timestamp = nowIso();

  if (!authHasData) {
    const localSettings = await localShiftSettingsStore.getByUserId(LOCAL_USER_ID);
    if (localSettings) {
      await localShiftSettingsStore.put({
        ...localSettings,
        id: createId(),
        userId: authUserId,
        updatedAt: timestamp,
        syncStatus: "pending",
      });
    }

    const localNotification = await localNotificationStore.getByUserId(LOCAL_USER_ID);
    if (localNotification) {
      await localNotificationStore.put({
        ...localNotification,
        id: createId(),
        userId: authUserId,
        updatedAt: timestamp,
        syncStatus: "pending",
      });
    }

    const localSleep = await localSleepStore.getAll(LOCAL_USER_ID);
    if (localSleep.length > 0) {
      await localSleepStore.putMany(
        localSleep.map((record) => ({
          ...record,
          id: createId(),
          userId: authUserId,
          updatedAt: timestamp,
          syncStatus: "pending" as const,
        })),
      );
    }

    const localLeaves = await localLeaveStore.getAll(LOCAL_USER_ID);
    for (const record of localLeaves) {
      await localLeaveStore.put({
        ...record,
        id: createId(),
        userId: authUserId,
        updatedAt: timestamp,
        syncStatus: "pending",
      });
    }

    const localMemos = await localMemoStore.getAll(LOCAL_USER_ID);
    for (const record of localMemos) {
      await localMemoStore.put({
        ...record,
        id: createId(),
        userId: authUserId,
        updatedAt: timestamp,
        syncStatus: "pending",
      });
    }
  }

  if (await getOnboardingCompleted(LOCAL_USER_ID)) {
    await setOnboardingCompleted(authUserId);
  }
}

export async function enqueuePendingLocalRecords(userId: string): Promise<void> {
  const shiftSettings = await localShiftSettingsStore.getByUserId(userId);
  if (shiftSettings?.syncStatus === "pending") {
    await syncQueueStore.enqueue({
      userId,
      operation: "upsert",
      entity: "shift_settings",
      entityId: shiftSettings.id,
      payload: shiftSettings,
    });
  }

  const notification = await localNotificationStore.getByUserId(userId);
  if (notification?.syncStatus === "pending") {
    await syncQueueStore.enqueue({
      userId,
      operation: "upsert",
      entity: "notification_settings",
      entityId: notification.id,
      payload: notification,
    });
  }

  const sleepSettings = await localSleepStore.getAll(userId);
  for (const record of sleepSettings.filter((item) => item.syncStatus === "pending")) {
    await syncQueueStore.enqueue({
      userId,
      operation: "upsert",
      entity: "sleep_settings",
      entityId: record.id,
      payload: record,
    });
  }

  const leaveRecords = await localLeaveStore.getAll(userId);
  for (const record of leaveRecords.filter((item) => item.syncStatus === "pending")) {
    await syncQueueStore.enqueue({
      userId,
      operation: "upsert",
      entity: "leave_record",
      entityId: record.id,
      payload: record,
    });
  }

  const memoRecords = await localMemoStore.getAll(userId);
  for (const record of memoRecords.filter((item) => item.syncStatus === "pending")) {
    await syncQueueStore.enqueue({
      userId,
      operation: "upsert",
      entity: "memo_record",
      entityId: record.id,
      payload: record,
    });
  }
}
