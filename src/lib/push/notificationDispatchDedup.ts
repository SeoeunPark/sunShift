import { createAdminClient } from "@/lib/supabase/admin";
import type { PlannedNotification } from "@/lib/notifications/notificationMessages";

function isMissingTableError(error: { code?: string; message?: string }): boolean {
  return (
    error.code === "PGRST205" ||
    Boolean(error.message?.includes("Could not find the table 'public.notification_dispatches'"))
  );
}

let dedupTableAvailable: boolean | null = null;

export function isNotificationDedupAvailable(): boolean {
  return dedupTableAvailable !== false;
}

export async function wasNotificationAlreadySent(
  userId: string,
  notification: PlannedNotification,
): Promise<boolean> {
  if (dedupTableAvailable === false) {
    return false;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("notification_dispatches")
    .select("id")
    .eq("user_id", userId)
    .eq("kind", notification.kind)
    .eq("reference_date", notification.data.date)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error)) {
      dedupTableAvailable = false;
      return false;
    }
    throw new Error(error.message);
  }

  dedupTableAvailable = true;
  return Boolean(data);
}

export async function recordNotificationSent(
  userId: string,
  notification: PlannedNotification,
): Promise<void> {
  if (dedupTableAvailable === false) {
    return;
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("notification_dispatches").upsert(
    {
      user_id: userId,
      kind: notification.kind,
      reference_date: notification.data.date,
    },
    { onConflict: "user_id,kind,reference_date", ignoreDuplicates: true },
  );

  if (error) {
    if (isMissingTableError(error)) {
      dedupTableAvailable = false;
      return;
    }
    throw new Error(error.message);
  }

  dedupTableAvailable = true;
}
