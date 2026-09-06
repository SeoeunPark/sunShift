import { NextResponse } from "next/server";
import { getVapidPublicKey, isPushConfigured } from "@/lib/push/config";

export async function GET() {
  const configured = isPushConfigured();

  return NextResponse.json({
    configured,
    publicKey: configured ? getVapidPublicKey() : null,
  });
}
