import { NextResponse } from "next/server";
import { runShiftNotificationDispatch } from "@/lib/push/runShiftNotificationDispatch";
import { isPushConfigured } from "@/lib/push/config";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return false;
  }

  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  return handleCron(request);
}

export async function GET(request: Request) {
  return handleCron(request);
}

async function handleCron(request: Request) {
  if (!isPushConfigured()) {
    return NextResponse.json({ error: "VAPID keys are not configured" }, { status: 503 });
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runShiftNotificationDispatch();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to dispatch notifications" },
      { status: 500 },
    );
  }
}
