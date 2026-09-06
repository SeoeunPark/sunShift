import Dexie, { type Table } from "dexie";
import type {
  LocalLeaveRecord,
  LocalMemoRecord,
  LocalNotificationSettings,
  LocalShiftSettings,
  LocalSleepSettings,
} from "@/types/local";
import type { SyncQueueItem } from "@/types/sync";
import { DB_NAME, DB_VERSION } from "./constants";

export interface DbMeta {
  key: string;
  value: string;
}

const BASE_STORES = {
  shiftSettings: "id, userId, updatedAt",
  leaveRecords: "id, userId, date, [userId+date], updatedAt",
  memoRecords: "id, userId, date, [userId+date], updatedAt",
  notificationSettings: "id, userId, updatedAt",
  sleepSettings: "id, userId, shiftCode, [userId+shiftCode], updatedAt",
  meta: "key",
} as const;

export class ShiftDatabase extends Dexie {
  shiftSettings!: Table<LocalShiftSettings, string>;
  leaveRecords!: Table<LocalLeaveRecord, string>;
  memoRecords!: Table<LocalMemoRecord, string>;
  notificationSettings!: Table<LocalNotificationSettings, string>;
  sleepSettings!: Table<LocalSleepSettings, string>;
  syncQueue!: Table<SyncQueueItem, string>;
  meta!: Table<DbMeta, string>;

  constructor(name = DB_NAME) {
    super(name);

    this.version(1).stores(BASE_STORES);

    this.version(DB_VERSION).stores({
      ...BASE_STORES,
      syncQueue: "id, userId, entity, entityId, [userId+entity+entityId], createdAt, retryCount",
    });
  }
}

export const shiftDb = new ShiftDatabase();

/** Test helper to use isolated in-memory database */
export function createTestDatabase(name: string): ShiftDatabase {
  return new ShiftDatabase(name);
}
