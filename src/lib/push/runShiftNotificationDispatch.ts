import { createAdminClient } from "@/lib/supabase/admin";
import {
  fromRemoteLeaveRecord,
  fromRemoteNotificationSettings,
  fromRemoteShiftSettings,
  toNotificationSettings,
  toShiftSettings,
} from "@/lib/db/mappers";
import { getSeoulDateTimeParts } from "@/lib/notifications/notificationPlanner";
import { planNotifications } from "@/lib/notifications/notificationPlanner";
import { planSleepNotifications } from "@/lib/notifications/sleepPlanner";
import type { PlannedNotification } from "@/lib/notifications/notificationMessages";
import {
  isNotificationDedupAvailable,
  recordNotificationSent,
  wasNotificationAlreadySent,
} from "@/lib/push/notificationDispatchDedup";
import { sendWebPushNotification } from "@/lib/push/sendWebPush";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";
import type { ShiftSettings } from "@/lib/shift/shiftTypes";

export interface ShiftNotificationRunResult {
  seoulDate: string;
  seoulTime: string;
  usersProcessed: number;
  notificationsSent: number;
  notificationsSkipped: number;
  failures: number;
  dedupAvailable: boolean;
  warnings: string[];
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

async function ensureNotificationSettings(userId: string) {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  const { data: created, error } = await supabase
    .from("notification_settings")
    .insert({ user_id: userId })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return created;
}

async function dispatchPlannedNotifications(
  userId: string,
  userSubscriptions: Array<{ id: string; endpoint: string; p256dh: string; auth: string }>,
  planned: PlannedNotification[],
  result: ShiftNotificationRunResult,
): Promise<void> {
  const supabase = createAdminClient();

  for (const notification of planned) {
    if (await wasNotificationAlreadySent(userId, notification)) {
      result.notificationsSkipped += 1;
      continue;
    }

    let sentForNotification = false;

    for (const subscription of userSubscriptions) {
      try {
        await sendWebPushNotification(subscription, notification);
        result.notificationsSent += 1;
        sentForNotification = true;
      } catch {
        result.failures += 1;
        await supabase.from("push_subscriptions").delete().eq("id", subscription.id);
      }
    }

    if (sentForNotification) {
      await recordNotificationSent(userId, notification);
    }
  }
}

async function dispatchForUser(
  userId: string,
  userSubscriptions: Array<{ id: string; endpoint: string; p256dh: string; auth: string }>,
  now: Date,
  result: ShiftNotificationRunResult,
): Promise<void> {
  const supabase = createAdminClient();
  result.usersProcessed += 1;

  const notificationRow = await ensureNotificationSettings(userId);
  const { data: leaveRows } = await supabase
    .from("leave_records")
    .select("*")
    .eq("user_id", userId);

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
    return;
  }

  await dispatchPlannedNotifications(userId, userSubscriptions, planned, result);
}

export async function runShiftNotificationDispatchForUser(
  userId: string,
  now = new Date(),
): Promise<ShiftNotificationRunResult> {
  const { date: seoulDate, time: seoulTime } = getSeoulDateTimeParts(now);
  const result: ShiftNotificationRunResult = {
    seoulDate,
    seoulTime,
    usersProcessed: 0,
    notificationsSent: 0,
    notificationsSkipped: 0,
    failures: 0,
    dedupAvailable: true,
    warnings: [],
  };

  const supabase = createAdminClient();
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  if (!subscriptions?.length) {
    return result;
  }

  await dispatchForUser(userId, subscriptions, now, result);
  result.dedupAvailable = isNotificationDedupAvailable();
  if (!result.dedupAvailable) {
    result.warnings.push("notification_dispatches table missing — run pending Supabase migrations");
  }

  return result;
}

export async function runShiftNotificationDispatch(
  now = new Date(),
): Promise<ShiftNotificationRunResult> {
  const supabase = createAdminClient();
  const { date: seoulDate, time: seoulTime } = getSeoulDateTimeParts(now);
  const result: ShiftNotificationRunResult = {
    seoulDate,
    seoulTime,
    usersProcessed: 0,
    notificationsSent: 0,
    notificationsSkipped: 0,
    failures: 0,
    dedupAvailable: true,
    warnings: [],
  };

  const { data: subscriptions, error } = await supabase.from("push_subscriptions").select("*");

  if (error) {
    throw new Error(error.message);
  }

  const subscriptionsByUser = new Map<string, NonNullable<typeof subscriptions>>();
  for (const subscription of subscriptions ?? []) {
    const current = subscriptionsByUser.get(subscription.user_id) ?? [];
    current.push(subscription);
    subscriptionsByUser.set(subscription.user_id, current);
  }

  for (const [userId, userSubscriptions] of subscriptionsByUser) {
    await dispatchForUser(userId, userSubscriptions, now, result);
  }

  result.dedupAvailable = isNotificationDedupAvailable();
  if (!result.dedupAvailable) {
    result.warnings.push("notification_dispatches table missing — run pending Supabase migrations");
  }

  return result;
}
