import { describe, expect, it } from "vitest";
import { getInstallInstructions, isBeforeInstallPromptEvent } from "../install";

describe("pwa install utils", () => {
  it("detects beforeinstallprompt events", () => {
    const event = {
      prompt: async () => {},
      userChoice: Promise.resolve({ outcome: "accepted", platform: "web" }),
    } as unknown as Event;

    expect(isBeforeInstallPromptEvent(event)).toBe(true);
    expect(isBeforeInstallPromptEvent(new Event("beforeinstallprompt"))).toBe(false);
  });

  it("returns install instructions", () => {
    expect(getInstallInstructions()).toBeTruthy();
  });
});
