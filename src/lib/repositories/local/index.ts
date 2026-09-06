import type { LocalLeaveRecord, LocalMemoRecord, LocalNotificationSettings, LocalShiftSettings, LocalSleepSettings } from "@/types/local";
import { ensureLocalDefaults } from "@/lib/db/initLocalDb";
import { shiftDb } from "@/lib/db/shiftDb";

export const localShiftSettingsStore = {
  async getByUserId(userId: string): Promise<LocalShiftSettings | undefined> {
    await ensureLocalDefaults(userId);
    return shiftDb.shiftSettings.where("userId").equals(userId).first();
  },

  async put(record: LocalShiftSettings): Promise<void> {
    await shiftDb.shiftSettings.put(record);
  },
};

export const localLeaveStore = {
  async getAll(userId: string): Promise<LocalLeaveRecord[]> {
    return shiftDb.leaveRecords.where("userId").equals(userId).sortBy("date");
  },

  async getByDate(userId: string, date: string): Promise<LocalLeaveRecord | undefined> {
    return shiftDb.leaveRecords.where("[userId+date]").equals([userId, date]).first();
  },

  async getById(id: string): Promise<LocalLeaveRecord | undefined> {
    return shiftDb.leaveRecords.get(id);
  },

  async put(record: LocalLeaveRecord): Promise<void> {
    await shiftDb.leaveRecords.put(record);
  },

  async delete(id: string): Promise<void> {
    await shiftDb.leaveRecords.delete(id);
  },
};

export const localMemoStore = {
  async getAll(userId: string): Promise<LocalMemoRecord[]> {
    return shiftDb.memoRecords.where("userId").equals(userId).sortBy("date");
  },

  async getByDate(userId: string, date: string): Promise<LocalMemoRecord | undefined> {
    return shiftDb.memoRecords.where("[userId+date]").equals([userId, date]).first();
  },

  async getById(id: string): Promise<LocalMemoRecord | undefined> {
    return shiftDb.memoRecords.get(id);
  },

  async put(record: LocalMemoRecord): Promise<void> {
    await shiftDb.memoRecords.put(record);
  },

  async delete(id: string): Promise<void> {
    await shiftDb.memoRecords.delete(id);
  },
};

export const localNotificationStore = {
  async getByUserId(userId: string): Promise<LocalNotificationSettings | undefined> {
    await ensureLocalDefaults(userId);
    return shiftDb.notificationSettings.where("userId").equals(userId).first();
  },

  async put(record: LocalNotificationSettings): Promise<void> {
    await shiftDb.notificationSettings.put(record);
  },
};

export const localSleepStore = {
  async getAll(userId: string): Promise<LocalSleepSettings[]> {
    await ensureLocalDefaults(userId);
    return shiftDb.sleepSettings.where("userId").equals(userId).sortBy("shiftCode");
  },

  async getByShiftCode(userId: string, shiftCode: LocalSleepSettings["shiftCode"]) {
    return shiftDb.sleepSettings.where("[userId+shiftCode]").equals([userId, shiftCode]).first();
  },

  async put(record: LocalSleepSettings): Promise<void> {
    await shiftDb.sleepSettings.put(record);
  },

  async putMany(records: LocalSleepSettings[]): Promise<void> {
    await shiftDb.sleepSettings.bulkPut(records);
  },
};
