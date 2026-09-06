import { createClient } from "@/lib/supabase/client";
import { getVapidPublicKey } from "@/lib/push/config";
import { urlBase64ToUint8Array } from "@/lib/push/vapid";
import { isPushSupported, registerServiceWorker } from "@/lib/pwa/registerServiceWorker";

export interface PushSubscriptionPayload {
  endpoint: string;
  p256dh: string;
  auth: string;
}

function serializePushSubscription(
  subscription: PushSubscription,
): PushSubscriptionPayload {
  const json = subscription.toJSON();

  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
    throw new Error("Invalid push subscription payload");
  }

  return {
    endpoint: json.endpoint,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
  };
}

export async function subscribeToPush(userId: string): Promise<PushSubscriptionPayload> {
  if (!isPushSupported()) {
    throw new Error("이 브라우저는 Web Push를 지원하지 않습니다.");
  }

  const vapidPublicKey = getVapidPublicKey();
  if (!vapidPublicKey) {
    throw new Error("VAPID 공개키가 설정되지 않았습니다.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("알림 권한이 필요합니다.");
  }

  const registration = (await registerServiceWorker())?.registration ?? (await navigator.serviceWorker.ready);
  const existing = await registration.pushManager.getSubscription();

  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    }));

  const payload = serializePushSubscription(subscription);
  const supabase = createClient();

  if (!supabase) {
    throw new Error("Supabase가 설정되지 않았습니다.");
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: payload.endpoint,
      p256dh: payload.p256dh,
      auth: payload.auth,
      user_agent: navigator.userAgent,
    },
    { onConflict: "user_id,endpoint" },
  );

  if (error) {
    throw new Error(error.message);
  }

  return payload;
}

export async function unsubscribeFromPush(userId: string): Promise<void> {
  if (!isPushSupported()) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();

    const supabase = createClient();
    if (supabase) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .eq("user_id", userId)
        .eq("endpoint", endpoint);
    }
  }
}

export async function getLocalPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}
