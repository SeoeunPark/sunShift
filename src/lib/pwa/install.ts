export type PwaInstallOutcome = "accepted" | "dismissed" | "unavailable";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function isBeforeInstallPromptEvent(
  event: Event,
): event is BeforeInstallPromptEvent {
  return "prompt" in event && typeof (event as BeforeInstallPromptEvent).prompt === "function";
}

export { getInstallInstructions, isAndroidDevice, isIosDevice } from "./notificationSetupGuide";
