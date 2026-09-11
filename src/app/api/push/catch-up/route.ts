import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isPushConfigured } from "@/lib/push/config";
import type { PushSubscriptionPayload } from "@/lib/push/subscription";
import { runShiftNotificationDispatchForUser } from "@/lib/push/runShiftNotificationDispatch";

function isValidPayload(body: unknown): body is PushSubscriptionPayload {
  if (!body || typeof body !== "object") {
    return false;
  }

  const candidate = body as Partial<PushSubscriptionPayload>;
  return Boolean(candidate.endpoint && candidate.p256dh && candidate.auth);
}

async function resolveUserIdFromPayload(
  payload: PushSubscriptionPayload,
): Promise<string | null> {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("push_subscriptions")
    .select("user_id")
    .eq("endpoint", payload.endpoint)
    .maybeSingle();

  if (existing?.user_id) {
    return existing.user_id;
  }

  const supabase = await createClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  await admin.from("push_subscriptions").delete().eq("endpoint", payload.endpoint);

  const { error } = await admin.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: payload.endpoint,
      p256dh: payload.p256dh,
      auth: payload.auth,
    },
    { onConflict: "user_id,endpoint" },
  );

  if (error) {
    throw new Error(error.message);
  }

  return user.id;
}

export async function POST(request: Request) {
  if (!isPushConfigured()) {
    return NextResponse.json({ error: "VAPID keys are not configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as unknown;

  try {
    let userId: string | null = null;

    if (isValidPayload(body)) {
      userId = await resolveUserIdFromPayload(body);
    } else {
      const supabase = await createClient();
      if (!supabase) {
        return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    }

    if (!userId) {
      return NextResponse.json({ error: "Push subscription not found" }, { status: 404 });
    }

    const result = await runShiftNotificationDispatchForUser(userId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to catch up notifications" },
      { status: 500 },
    );
  }
}
