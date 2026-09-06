import { META_KEYS } from "./constants";
import {
  createDefaultNotificationSettings,
  createDefaultShiftSettings,
  createDefaultSleepSettings,
} from "./mappers";
import { setOnboardingCompleted } from "@/lib/onboarding/onboardingStatus";
import { shiftDb } from "./shiftDb";

export async function getMeta(key: string): Promise<string | undefined> {
  const row = await shiftDb.meta.get(key);
  return row?.value;
}

export async function setMeta(key: string, value: string): Promise<void> {
  await shiftDb.meta.put({ key, value });
}

export async function hasShiftSettings(userId: string): Promise<boolean> {
  const count = await shiftDb.shiftSettings.where("userId").equals(userId).count();
  return count > 0;
}

/** Seed default local data for a user if missing */
export async function ensureLocalDefaults(userId: string): Promise<void> {
  const hasSettings = await hasShiftSettings(userId);

  if (!hasSettings) {
    await shiftDb.shiftSettings.put(createDefaultShiftSettings(userId));
  } else {
    await setOnboardingCompleted(userId);
  }

  const notificationCount = await shiftDb.notificationSettings
    .where("userId")
    .equals(userId)
    .count();

  if (notificationCount === 0) {
    await shiftDb.notificationSettings.put(createDefaultNotificationSettings(userId));
  } else {
    const existing = await shiftDb.notificationSettings.where("userId").equals(userId).first();
    if (existing && existing.sleepEnabled === undefined) {
      await shiftDb.notificationSettings.put({
        ...existing,
        sleepEnabled: true,
        beforeShiftEnabled: false,
        offDayEnabled: false,
        leaveEnabled: false,
        updatedAt: new Date().toISOString(),
        syncStatus: "pending",
      });
    }
  }

  const sleepCount = await shiftDb.sleepSettings.where("userId").equals(userId).count();

  if (sleepCount === 0) {
    await shiftDb.sleepSettings.bulkPut(createDefaultSleepSettings(userId));
  }

  await setMeta(`${META_KEYS.dbInitialized}:${userId}`, "true");
}

export async function initLocalDb(userId: string): Promise<void> {
  await ensureLocalDefaults(userId);
  await setMeta(META_KEYS.activeUserId, userId);
}

export async function clearUserData(userId: string): Promise<void> {
  await shiftDb.transaction(
    "rw",
    [
      shiftDb.shiftSettings,
      shiftDb.leaveRecords,
      shiftDb.memoRecords,
      shiftDb.notificationSettings,
      shiftDb.sleepSettings,
    ],
    async () => {
      await shiftDb.shiftSettings.where("userId").equals(userId).delete();
      await shiftDb.leaveRecords.where("userId").equals(userId).delete();
      await shiftDb.memoRecords.where("userId").equals(userId).delete();
      await shiftDb.notificationSettings.where("userId").equals(userId).delete();
      await shiftDb.sleepSettings.where("userId").equals(userId).delete();
    },
  );
}
