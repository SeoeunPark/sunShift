import { NextResponse } from "next/server";
import { buildWidgetSnapshot } from "@/lib/widget/buildWidgetSnapshot";
import { WIDGET_LAYOUT_SPECS } from "@/lib/widget/widgetTypes";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";

/**
 * Widget data feed for a future iOS WidgetKit extension.
 * Uses default shift settings until authenticated user settings are wired server-side.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;

  const snapshot = buildWidgetSnapshot(DEFAULT_SHIFT_SETTINGS, { origin });

  return NextResponse.json({
    snapshot,
    layouts: WIDGET_LAYOUT_SPECS,
  });
}
