import { createId, nowIso, toNotificationSettings, toSleepSetting } from "@/lib/db/mappers";
import { enqueueSync } from "@/lib/sync";
import type {
  NotificationSettings,
  SleepSetting,
  UpdateNotificationSettingsInput,
  UpdateSleepSettingInput,
} from "@/types/local";
import type { SleepShiftCode } from "@/types/database";
import { localNotificationStore, localSleepStore } from "./local";

export class NotificationRepository {
  async getSettings(userId: string): Promise<NotificationSettings> {
    const local = await localNotificationStore.getByUserId(userId);
    if (!local) {
      throw new Error("Notification settings not found");
    }
    return toNotificationSettings(local);
  }

  async updateSettings(
    userId: string,
    input: UpdateNotificationSettingsInput,
  ): Promise<NotificationSettings> {
    const existing = await localNotificationStore.getByUserId(userId);
    if (!existing) {
      throw new Error("Notification settings not found");
    }

    const record = {
      ...existing,
      ...input,
      updatedAt: nowIso(),
      syncStatus: "pending" as const,
    };

    await localNotificationStore.put(record);
    await enqueueSync(userId, {
      operation: "upsert",
      entity: "notification_settings",
      entityId: record.id,
      payload: record,
    });

    return toNotificationSettings(record);
  }

  async getSleepSettings(userId: string): Promise<SleepSetting[]> {
    const records = await localSleepStore.getAll(userId);
    return records.map(toSleepSetting);
  }

  async updateSleepSetting(
    userId: string,
    shiftCode: SleepShiftCode,
    input: UpdateSleepSettingInput,
  ): Promise<SleepSetting> {
    const existing = await localSleepStore.getByShiftCode(userId, shiftCode);

    const record = existing ?? {
      id: createId(),
      userId,
      shiftCode,
      enabled: true,
      notificationTime: "22:30",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      syncStatus: "pending" as const,
    };

    const next = {
      ...record,
      enabled: input.enabled ?? record.enabled,
      notificationTime: input.notificationTime ?? record.notificationTime,
      updatedAt: nowIso(),
      syncStatus: "pending" as const,
    };

    await localSleepStore.put(next);
    await enqueueSync(userId, {
      operation: "upsert",
      entity: "sleep_settings",
      entityId: next.id,
      payload: next,
    });

    return toSleepSetting(next);
  }
}

export const notificationRepository = new NotificationRepository();
