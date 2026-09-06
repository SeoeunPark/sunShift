import { createAdminClient } from "@/lib/supabase/admin";
import {
  fromRemoteLeaveRecord,
  fromRemoteNotificationSettings,
  fromRemoteShiftSettings,
  toNotificationSettings,
  toShiftSettings,
} from "@/lib/db/mappers";
import { planNotifications } from "@/lib/notifications/notificationPlanner";
import { planSleepNotifications } from "@/lib/notifications/sleepPlanner";
import { sendWebPushNotification } from "@/lib/push/sendWebPush";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";
import type { ShiftSettings } from "@/lib/shift/shiftTypes";

interface ShiftNotificationRunResult {
  usersProcessed: number;
  notificationsSent: number;
  failures: number;
}

async function loadShiftSettings(userId: string): Promise<ShiftSettings> {
  const supabase = createAdminClient();

  const { data: settingsRow } = await supabase
    .from("shift_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!settingsRow) {
    return { ...DEFAULT_SHIFT_SETTINGS, userId };
  }

  const { data: definitions } = await supabase
    .from("shift_definitions")
    .select("*")
    .eq("shift_settings_id", settingsRow.id);

  return toShiftSettings(fromRemoteShiftSettings(settingsRow, definitions ?? []));
}

export async function runShiftNotificationDispatch(now = new Date()): Promise<ShiftNotificationRunResult> {
  const supabase = createAdminClient();
  const result: ShiftNotificationRunResult = {
    usersProcessed: 0,
    notificationsSent: 0,
    failures: 0,
  };

  const { data: subscriptions, error } = await supabase.from("push_subscriptions").select("*");

  if (error) {
    throw new Error(error.message);
  }

  const subscriptionsByUser = new Map<string, typeof subscriptions>();
  for (const subscription of subscriptions ?? []) {
    const current = subscriptionsByUser.get(subscription.user_id) ?? [];
    current.push(subscription);
    subscriptionsByUser.set(subscription.user_id, current);
  }

  for (const [userId, userSubscriptions] of subscriptionsByUser) {
    result.usersProcessed += 1;

    const [{ data: notificationRow }, { data: leaveRows }] = await Promise.all([
      supabase.from("notification_settings").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("leave_records").select("*").eq("user_id", userId),
    ]);

    if (!notificationRow) {
      continue;
    }

    const settings = toNotificationSettings(fromRemoteNotificationSettings(notificationRow));
    const shiftSettings = await loadShiftSettings(userId);
    const leaveDates = (leaveRows ?? []).map((row) => fromRemoteLeaveRecord(row).date);

    const planned = [
      ...planNotifications({
        now,
        settings,
        shiftSettings,
        leaveDates,
      }),
      ...planSleepNotifications({
        now,
        sleepEnabled: settings.sleepEnabled,
        shiftSettings,
        leaveDates,
      }),
    ];

    if (planned.length === 0) {
      continue;
    }

    for (const notification of planned) {
      for (const subscription of userSubscriptions) {
        try {
          await sendWebPushNotification(subscription, notification);
          result.notificationsSent += 1;
        } catch {
          result.failures += 1;
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("id", subscription.id);
        }
      }
    }
  }

  return result;
}
