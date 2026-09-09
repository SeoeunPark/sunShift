import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isPushConfigured } from "@/lib/push/config";
import { runShiftNotificationDispatchForUser } from "@/lib/push/runShiftNotificationDispatch";

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

  try {
    const result = await runShiftNotificationDispatchForUser(user.id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to catch up notifications" },
      { status: 500 },
    );
  }
}
