import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isPushConfigured } from "@/lib/push/config";
import { sendTestPushNotification } from "@/lib/push/sendWebPush";

export async function POST() {
  if (!isPushConfigured()) {
    return NextResponse.json({ error: "VAPID keys are not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      failures.push(err instanceof Error ? err.message : "Unknown error");
      await supabase.from("push_subscriptions").delete().eq("id", subscription.id);
    }
  }

  if (sent === 0) {
    return NextResponse.json({ error: failures[0] ?? "Failed to send test notification" }, { status: 500 });
  }

  return NextResponse.json({
    message: `테스트 알림 ${sent}건을 전송했습니다.`,
    sent,
    failures,
  });
}
