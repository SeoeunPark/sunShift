import { createClient } from "@/lib/supabase/client";
import {
  fromRemoteLeaveRecord,
  fromRemoteMemoRecord,
  fromRemoteNotificationSettings,
  fromRemoteShiftSettings,
  fromRemoteSleepSettings,
} from "@/lib/db/mappers";
import type { ShiftSettings } from "@/lib/shift/shiftTypes";
import type { LocalLeaveRecord, LocalMemoRecord, LocalNotificationSettings, LocalShiftSettings, LocalSleepSettings } from "@/types/local";
import { mapShiftDefinitionToRow, mapShiftSettingsToRow } from "@/lib/supabase/mappers";

function getSupabase() {
  return createClient();
}

export const remoteShiftSettingsStore = {
  async getByUserId(userId: string): Promise<LocalShiftSettings | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data: settingsRow, error } = await supabase
      .from("shift_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !settingsRow) return null;

    const { data: definitions } = await supabase
      .from("shift_definitions")
      .select("*")
      .eq("shift_settings_id", settingsRow.id);

    return fromRemoteShiftSettings(settingsRow, definitions ?? []);
  },

  async upsert(userId: string, settings: ShiftSettings): Promise<LocalShiftSettings | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const payload = mapShiftSettingsToRow({ ...settings, userId });
    const { data: settingsRow, error } = await supabase
      .from("shift_settings")
      .upsert(
        {
          id: payload.id || undefined,
          user_id: userId,
          group_number: payload.group_number,
          base_date: payload.base_date,
          base_shift: payload.base_shift,
          pattern_id: payload.pattern_id,
        },
        { onConflict: "user_id" },
      )
      .select("*")
      .single();

    if (error || !settingsRow) return null;

    const definitionRows = settings.shiftDefinitions.map((definition) =>
      mapShiftDefinitionToRow(definition, settingsRow.id),
    );

    await supabase.from("shift_definitions").delete().eq("shift_settings_id", settingsRow.id);

    const { data: insertedDefinitions } = await supabase
      .from("shift_definitions")
      .insert(definitionRows)
      .select("*");

    return fromRemoteShiftSettings(settingsRow, insertedDefinitions ?? []);
  },
};

export const remoteLeaveStore = {
  async getAll(userId: string): Promise<LocalLeaveRecord[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    const { data } = await supabase
      .from("leave_records")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    return (data ?? []).map(fromRemoteLeaveRecord);
  },

  async upsert(record: LocalLeaveRecord): Promise<LocalLeaveRecord | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("leave_records")
      .upsert(
        {
          id: record.id,
          user_id: record.userId,
          date: record.date,
          memo: record.memo,
        },
        { onConflict: "user_id,date" },
      )
      .select("*")
      .single();

    if (error || !data) return null;
    return fromRemoteLeaveRecord(data);
  },

  async delete(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    const { error } = await supabase.from("leave_records").delete().eq("id", id);
    return !error;
  },
};

export const remoteMemoStore = {
  async getAll(userId: string): Promise<LocalMemoRecord[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    const { data } = await supabase
      .from("memo_records")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    return (data ?? []).map(fromRemoteMemoRecord);
  },

  async upsert(record: LocalMemoRecord): Promise<LocalMemoRecord | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("memo_records")
      .upsert(
        {
          id: record.id,
          user_id: record.userId,
          date: record.date,
          content: record.content,
        },
        { onConflict: "user_id,date" },
      )
      .select("*")
      .single();

    if (error || !data) return null;
    return fromRemoteMemoRecord(data);
  },

  async delete(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    const { error } = await supabase.from("memo_records").delete().eq("id", id);
    return !error;
  },
};

export const remoteNotificationStore = {
  async getByUserId(userId: string): Promise<LocalNotificationSettings | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    return data ? fromRemoteNotificationSettings(data) : null;
  },

  async upsert(record: LocalNotificationSettings): Promise<LocalNotificationSettings | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("notification_settings")
      .upsert(
        {
          id: record.id,
          user_id: record.userId,
          today_enabled: record.todayEnabled,
          today_time: record.todayTime,
          tomorrow_enabled: record.tomorrowEnabled,
          tomorrow_time: record.tomorrowTime,
          before_shift_enabled: record.beforeShiftEnabled,
          before_shift_minutes: record.beforeShiftMinutes,
          off_day_enabled: record.offDayEnabled,
          leave_enabled: record.leaveEnabled,
          sleep_enabled: record.sleepEnabled,
        },
        { onConflict: "user_id" },
      )
      .select("*")
      .single();

    if (error || !data) return null;
    return fromRemoteNotificationSettings(data);
  },
};

export const remoteSleepStore = {
  async getAll(userId: string): Promise<LocalSleepSettings[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    const { data } = await supabase
      .from("sleep_settings")
      .select("*")
      .eq("user_id", userId)
      .order("shift_code", { ascending: true });

    return (data ?? []).map(fromRemoteSleepSettings);
  },

  async upsert(record: LocalSleepSettings): Promise<LocalSleepSettings | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("sleep_settings")
      .upsert(
        {
          id: record.id,
          user_id: record.userId,
          shift_code: record.shiftCode,
          enabled: record.enabled,
          notification_time: record.notificationTime,
        },
        { onConflict: "user_id,shift_code" },
      )
      .select("*")
      .single();

    if (error || !data) return null;
    return fromRemoteSleepSettings(data);
  },
};
