import type { ShiftSettings } from "@/lib/shift/shiftTypes";
import { buildWidgetSnapshot } from "./buildWidgetSnapshot";
import {
  ANDROID_WIDGET_PROVIDER,
  WIDGET_APP_GROUP,
  WIDGET_SNAPSHOT_KEY,
} from "./widgetConstants";

let androidWidgetsRegistered = false;

export async function syncWidgetSnapshotToNative(
  settings: ShiftSettings,
  options?: { today?: string; origin?: string },
): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  const origin = options?.origin ?? window.location.origin;
  const snapshot = buildWidgetSnapshot(settings, {
    today: options?.today,
    origin,
  });
  const payload = JSON.stringify(snapshot);

  try {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    const { WidgetBridgePlugin } = await import("capacitor-widget-bridge");

    if (Capacitor.getPlatform() === "android" && !androidWidgetsRegistered) {
      await WidgetBridgePlugin.setRegisteredWidgets({
        widgets: [ANDROID_WIDGET_PROVIDER],
      });
      androidWidgetsRegistered = true;
    }

    await WidgetBridgePlugin.setItem({
      key: WIDGET_SNAPSHOT_KEY,
      group: WIDGET_APP_GROUP,
      value: payload,
    });

    await WidgetBridgePlugin.reloadAllTimelines();
    return true;
  } catch {
    return false;
  }
}

export async function requestAndroidWidgetPin(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.getPlatform() !== "android") {
      return false;
    }

    const { WidgetBridgePlugin } = await import("capacitor-widget-bridge");
    const result = await WidgetBridgePlugin.requestWidget();
    return Boolean(result.results);
  } catch {
    return false;
  }
}
