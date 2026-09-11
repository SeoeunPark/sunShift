import type { LeaveType } from "@/lib/leave/leaveTypes";
import type { ShiftCode, ShiftDefinition, ShiftSettings } from "@/lib/shift/shiftTypes";
import type { SleepShiftCode } from "@/types/database";

export type SyncStatus = "synced" | "pending" | "conflict";

export interface BaseLocalRecord {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
}

export interface LocalShiftSettings extends BaseLocalRecord {
  groupNumber: number;
  baseDate: string;
  baseShift: ShiftCode;
  patternId: string;
  shiftDefinitions: ShiftDefinition[];
}

export interface LocalLeaveRecord extends BaseLocalRecord {
  date: string;
  type: LeaveType;
  memo: string | null;
}

export interface LocalMemoRecord extends BaseLocalRecord {
  date: string;
  content: string;
}

export interface LocalNotificationSettings extends BaseLocalRecord {
  todayEnabled: boolean;
  todayTime: string;
  tomorrowEnabled: boolean;
  tomorrowTime: string;
  beforeShiftEnabled: boolean;
  beforeShiftMinutes: number;
  offDayEnabled: boolean;
  leaveEnabled: boolean;
  sleepEnabled: boolean;
}

export interface LocalSleepSettings extends BaseLocalRecord {
  shiftCode: SleepShiftCode;
  enabled: boolean;
  notificationTime: string;
}

export interface LeaveRecord {
  id: string;
  userId: string;
  date: string;
  type: LeaveType;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MemoRecord {
  id: string;
  userId: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  todayEnabled: boolean;
  todayTime: string;
  tomorrowEnabled: boolean;
  tomorrowTime: string;
  beforeShiftEnabled: boolean;
  beforeShiftMinutes: number;
  offDayEnabled: boolean;
  leaveEnabled: boolean;
  sleepEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SleepSetting {
  id: string;
  userId: string;
  shiftCode: SleepShiftCode;
  enabled: boolean;
  notificationTime: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateLeaveInput = Pick<LeaveRecord, "date" | "type" | "memo">;
export type UpdateLeaveInput = Partial<Pick<LeaveRecord, "date" | "type" | "memo">>;

export type CreateMemoInput = Pick<MemoRecord, "date" | "content">;
export type UpdateMemoInput = Partial<Pick<MemoRecord, "date" | "content">>;

export type UpdateShiftSettingsInput = Partial<
  Pick<ShiftSettings, "groupNumber" | "baseDate" | "baseShift" | "patternId" | "shiftDefinitions">
>;

export type UpdateNotificationSettingsInput = Partial<
  Omit<NotificationSettings, "id" | "userId" | "createdAt" | "updatedAt">
>;

export type UpdateSleepSettingInput = Partial<
  Pick<SleepSetting, "enabled" | "notificationTime">
>;
