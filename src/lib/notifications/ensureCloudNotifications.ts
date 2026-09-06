import { isLocalUser } from "@/lib/repositories/getUserId";
import { subscribeToPush } from "@/lib/push/subscription";
import { ensureCloudSession } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { onLogin } from "@/lib/sync";

/** Create a cloud session if needed and migrate local data. */
export async function ensureCloudNotifications(): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase가 설정되지 않았습니다.");
  }

  const userId = await ensureCloudSession();
  if (!userId) {
    throw new Error("클라우드 연결에 실패했습니다.");
  }

  await onLogin(userId);

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
