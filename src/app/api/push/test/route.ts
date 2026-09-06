import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isPushConfigured } from "@/lib/push/config";
import type { PushSubscriptionPayload } from "@/lib/push/subscription";
import { sendTestPushNotification } from "@/lib/push/sendWebPush";
import { formatWebPushError } from "@/lib/push/webPushErrors";

function isValidPayload(body: unknown): body is PushSubscriptionPayload {
  if (!body || typeof body !== "object") {
    return false;
  }

  const candidate = body as Partial<PushSubscriptionPayload>;
  return Boolean(candidate.endpoint && candidate.p256dh && candidate.auth);
}

async function sendToPayload(payload: PushSubscriptionPayload) {
  await sendTestPushNotification(payload);
  return NextResponse.json({
    message: "테스트 알림을 보냈습니다.",
    sent: 1,
  });
}

export async function POST(request: Request) {
  if (!isPushConfigured()) {
    return NextResponse.json({ error: "VAPID keys are not configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as unknown;
  if (isValidPayload(body)) {
    try {
      return await sendToPayload(body);
    } catch (err) {
      return NextResponse.json({ error: formatWebPushError(err) }, { status: 500 });
    }
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Push subscription not found" }, { status: 404 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Push subscription not found" }, { status: 404 });
  }

  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!subscriptions?.length) {
    return NextResponse.json({ error: "Push subscription not found" }, { status: 404 });
  }

  let sent = 0;
  const failures: string[] = [];

  for (const subscription of subscriptions) {
    try {
      await sendTestPushNotification(subscription);
      sent += 1;
    } catch (err) {
      failures.push(formatWebPushError(err));
      await supabase.from("push_subscriptions").delete().eq("id", subscription.id);
    }
  }

  if (sent === 0) {
    return NextResponse.json(
      { error: failures[0] ?? "Failed to send test notification" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: `테스트 알림 ${sent}건을 전송했습니다.`,
    sent,
    failures,
  });
}
