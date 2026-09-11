import { normalizeLeaveType } from "@/lib/leave/leaveTypes";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";
import type { ShiftSettings } from "@/lib/shift/shiftTypes";
import type {
  LocalNotificationSettings,
  LocalShiftSettings,
  LocalSleepSettings,
  NotificationSettings,
  SleepSetting,
} from "@/types/local";
import type {
  LeaveRecord as DbLeaveRecord,
  MemoRecord as DbMemoRecord,
  NotificationSettings as DbNotificationSettings,
  SleepSettings as DbSleepSettings,
} from "@/types/database";
import { mapShiftDefinitions, mapShiftSettingsRow } from "@/lib/supabase/mappers";
import type { ShiftDefinitionRow, ShiftSettingsRow } from "@/types/database";

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function createDefaultShiftSettings(userId: string): LocalShiftSettings {
  const timestamp = nowIso();
  return {
    id: createId(),
    userId,
    groupNumber: DEFAULT_SHIFT_SETTINGS.groupNumber,
    baseDate: DEFAULT_SHIFT_SETTINGS.baseDate,
    baseShift: DEFAULT_SHIFT_SETTINGS.baseShift,
    patternId: DEFAULT_SHIFT_SETTINGS.patternId,
    shiftDefinitions: DEFAULT_SHIFT_SETTINGS.shiftDefinitions,
    createdAt: timestamp,
    updatedAt: timestamp,
    syncStatus: "pending",
  };
}

export function createDefaultNotificationSettings(userId: string): LocalNotificationSettings {
  const timestamp = nowIso();
  return {
    id: createId(),
    userId,
    todayEnabled: true,
    todayTime: "07:00",
    tomorrowEnabled: true,
    tomorrowTime: "20:00",
    beforeShiftEnabled: false,
    beforeShiftMinutes: 120,
    offDayEnabled: false,
    leaveEnabled: false,
    sleepEnabled: true,
    createdAt: timestamp,
    updatedAt: timestamp,
    syncStatus: "pending",
  };
}

export function createDefaultSleepSettings(userId: string): LocalSleepSettings[] {
  const defaults = [
    { shiftCode: "A" as const, notificationTime: "22:30" },
    { shiftCode: "B" as const, notificationTime: "00:30" },
    { shiftCode: "C" as const, notificationTime: "08:00" },
  ];

  const timestamp = nowIso();

  return defaults.map((item) => ({
    id: createId(),
    userId,
    shiftCode: item.shiftCode,
    enabled: true,
    notificationTime: item.notificationTime,
    createdAt: timestamp,
    updatedAt: timestamp,
    syncStatus: "pending" as const,
  }));
}

export function toShiftSettings(local: LocalShiftSettings): ShiftSettings {
  return {
    id: local.id,
    userId: local.userId,
    groupNumber: local.groupNumber,
    baseDate: local.baseDate,
    baseShift: local.baseShift,
    patternId: local.patternId,
    shiftDefinitions: local.shiftDefinitions,
  };
}

export function toNotificationSettings(local: LocalNotificationSettings): NotificationSettings {
  return {
    id: local.id,
    userId: local.userId,
    todayEnabled: local.todayEnabled,
    todayTime: local.todayTime,
    tomorrowEnabled: local.tomorrowEnabled,
    tomorrowTime: local.tomorrowTime,
    beforeShiftEnabled: local.beforeShiftEnabled,
    beforeShiftMinutes: local.beforeShiftMinutes,
    offDayEnabled: local.offDayEnabled,
    leaveEnabled: local.leaveEnabled,
    sleepEnabled: local.sleepEnabled ?? true,
    createdAt: local.createdAt,
    updatedAt: local.updatedAt,
  };
}

export function toSleepSetting(local: LocalSleepSettings): SleepSetting {
  return {
    id: local.id,
    userId: local.userId,
    shiftCode: local.shiftCode,
    enabled: local.enabled,
    notificationTime: local.notificationTime,
    createdAt: local.createdAt,
    updatedAt: local.updatedAt,
  };
}

export function fromRemoteShiftSettings(
  settingsRow: ShiftSettingsRow,
  definitionRows: ShiftDefinitionRow[],
): LocalShiftSettings {
  const mapped = mapShiftSettingsRow(settingsRow, definitionRows);
  return {
    id: mapped.id ?? createId(),
    userId: mapped.userId ?? settingsRow.user_id,
    groupNumber: mapped.groupNumber,
    baseDate: mapped.baseDate,
    baseShift: mapped.baseShift,
    patternId: mapped.patternId,
    shiftDefinitions: mapped.shiftDefinitions,
    createdAt: settingsRow.created_at,
    updatedAt: settingsRow.updated_at,
    syncStatus: "synced",
  };
}

export function fromRemoteNotificationSettings(row: DbNotificationSettings): LocalNotificationSettings {
  return {
    id: row.id,
    userId: row.user_id,
    todayEnabled: row.today_enabled,
    todayTime: row.today_time.slice(0, 5),
    tomorrowEnabled: row.tomorrow_enabled,
    tomorrowTime: row.tomorrow_time.slice(0, 5),
    beforeShiftEnabled: row.before_shift_enabled,
    beforeShiftMinutes: row.before_shift_minutes,
    offDayEnabled: row.off_day_enabled,
    leaveEnabled: row.leave_enabled,
    sleepEnabled: row.sleep_enabled ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    syncStatus: "synced",
  };
}

export function fromRemoteSleepSettings(row: DbSleepSettings): LocalSleepSettings {
  return {
    id: row.id,
    userId: row.user_id,
    shiftCode: row.shift_code,
    enabled: row.enabled,
    notificationTime: row.notification_time.slice(0, 5),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    syncStatus: "synced",
  };
}

export function fromRemoteLeaveRecord(row: DbLeaveRecord): import("@/types/local").LocalLeaveRecord {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    type: normalizeLeaveType(row.type),
    memo: row.memo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    syncStatus: "synced",
  };
}

export function fromRemoteMemoRecord(row: DbMemoRecord): import("@/types/local").LocalMemoRecord {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    syncStatus: "synced",
  };
}

export function mapShiftDefinitionsFromRemote(rows: ShiftDefinitionRow[]) {
  return mapShiftDefinitions(rows);
}
