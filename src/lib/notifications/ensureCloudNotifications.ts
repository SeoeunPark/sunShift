import { isLocalUser } from "@/lib/repositories/getUserId";
import {
  getPushSubscriptionPayload,
  subscribeToPush,
} from "@/lib/push/subscription";
import { ensureCloudSession } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { onLogin } from "@/lib/sync";

async function syncExistingPushSubscription(userId: string): Promise<void> {
  const payload = await getPushSubscriptionPayload();
  if (!payload || isLocalUser(userId)) {
    return;
  }

  const supabase = createClient();
  if (!supabase) {
    return;
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: payload.endpoint,
      p256dh: payload.p256dh,
      auth: payload.auth,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    },
    { onConflict: "user_id,endpoint" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

/** Create a cloud session if needed, migrate local data, and sync push settings. */
export async function ensureCloudNotifications(): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase가 설정되지 않았습니다.");
  }

  const userId = await ensureCloudSession();
  if (!userId) {
    throw new Error("클라우드 연결에 실패했습니다.");
  }

  await onLogin(userId);
  await syncExistingPushSubscription(userId);

  return userId;
}

/** Enable push and register the device for scheduled notifications. */
export async function enableCloudPushNotifications(userId: string): Promise<string> {
  const activeUserId = isLocalUser(userId) ? await ensureCloudNotifications() : userId;

  if (!isLocalUser(activeUserId)) {
    await onLogin(activeUserId);
  }

  await subscribeToPush(activeUserId);
  return activeUserId;
}
