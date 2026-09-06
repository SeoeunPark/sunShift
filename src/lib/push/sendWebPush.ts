import webpush from "web-push";
import type { PushSubscription } from "@/types/database";
import { getVapidPublicKey, getVapidSubject, isPushConfigured } from "@/lib/push/config";
import type { PlannedNotification } from "@/lib/notifications/notificationMessages";
import { formatWebPushError } from "@/lib/push/webPushErrors";

function ensureWebPushConfigured(): void {
  if (!isPushConfigured()) {
    throw new Error("VAPID keys are not configured");
  }

  webpush.setVapidDetails(
    getVapidSubject(),
    getVapidPublicKey()!,
    process.env.VAPID_PRIVATE_KEY!.trim(),
  );
}

export async function sendWebPushNotification(
  subscription: Pick<PushSubscription, "endpoint" | "p256dh" | "auth">,
  notification: PlannedNotification,
): Promise<void> {
  ensureWebPushConfigured();

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify({
        title: notification.title,
        body: notification.body,
        data: notification.data,
      }),
    );
  } catch (error) {
    throw new Error(formatWebPushError(error));
  }
}

export async function sendTestPushNotification(
  subscription: Pick<PushSubscription, "endpoint" | "p256dh" | "auth">,
): Promise<void> {
  await sendWebPushNotification(subscription, {
    kind: "today_shift",
    title: "SHIFT",
    body: "테스트 알림입니다. Web Push가 정상 동작합니다.",
    data: { kind: "today_shift", date: new Date().toISOString().slice(0, 10) },
  });
}
