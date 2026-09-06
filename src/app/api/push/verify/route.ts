import { NextResponse } from "next/server";
import { getVapidDiagnostics } from "@/lib/push/verifyVapidPair";

export async function GET() {
  const diagnostics = getVapidDiagnostics();

  return NextResponse.json(diagnostics);
}
