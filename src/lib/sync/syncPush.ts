import { toShiftSettings } from "@/lib/db/mappers";
import type {
  LocalLeaveRecord,
  LocalMemoRecord,
  LocalNotificationSettings,
  LocalShiftSettings,
  LocalSleepSettings,
} from "@/types/local";
import type { SyncQueueItem } from "@/types/sync";
import {
  remoteLeaveStore,
  remoteMemoStore,
  remoteNotificationStore,
  remoteShiftSettingsStore,
  remoteSleepStore,
} from "@/lib/repositories/remote";

export async function pushQueueItem(item: SyncQueueItem): Promise<boolean> {
  switch (item.entity) {
    case "shift_settings": {
      if (item.operation === "upsert") {
        const payload = JSON.parse(item.payload) as LocalShiftSettings;
        const result = await remoteShiftSettingsStore.upsert(item.userId, toShiftSettings(payload));
        return result !== null;
      }
      return true;
    }
    case "leave_record": {
      if (item.operation === "upsert") {
        const payload = JSON.parse(item.payload) as LocalLeaveRecord;
        const result = await remoteLeaveStore.upsert(payload);
        return result !== null;
      }
      if (item.operation === "delete") {
        return remoteLeaveStore.delete(item.entityId);
      }
      return true;
    }
    case "memo_record": {
      if (item.operation === "upsert") {
        const payload = JSON.parse(item.payload) as LocalMemoRecord;
        const result = await remoteMemoStore.upsert(payload);
        return result !== null;
      }
      if (item.operation === "delete") {
        return remoteMemoStore.delete(item.entityId);
      }
      return true;
    }
    case "notification_settings": {
      if (item.operation === "upsert") {
        const payload = JSON.parse(item.payload) as LocalNotificationSettings;
        const result = await remoteNotificationStore.upsert(payload);
        return result !== null;
      }
      return true;
    }
    case "sleep_settings": {
      if (item.operation === "upsert") {
        const payload = JSON.parse(item.payload) as LocalSleepSettings;
        const result = await remoteSleepStore.upsert(payload);
        return result !== null;
      }
      return true;
    }
    default:
      return false;
  }
}
