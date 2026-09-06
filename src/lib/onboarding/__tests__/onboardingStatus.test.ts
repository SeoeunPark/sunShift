import { beforeEach, describe, expect, it } from "vitest";
import { LOCAL_USER_ID } from "@/lib/db/constants";
import { ensureLocalDefaults } from "@/lib/db/initLocalDb";
import { shiftDb } from "@/lib/db/shiftDb";
import {
  getOnboardingCompleted,
  setOnboardingCompleted,
} from "@/lib/onboarding/onboardingStatus";

async function clearDatabase() {
  await shiftDb.delete();
  await shiftDb.open();
}

describe("onboardingStatus", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it("returns false when onboarding was never completed", async () => {
    await expect(getOnboardingCompleted(LOCAL_USER_ID)).resolves.toBe(false);
  });

  it("returns true after onboarding is marked complete", async () => {
    await setOnboardingCompleted(LOCAL_USER_ID);
    await expect(getOnboardingCompleted(LOCAL_USER_ID)).resolves.toBe(true);
  });

  it("marks existing users as onboarding complete during init", async () => {
    await ensureLocalDefaults(LOCAL_USER_ID);
    await expect(getOnboardingCompleted(LOCAL_USER_ID)).resolves.toBe(false);

    await ensureLocalDefaults(LOCAL_USER_ID);
    await expect(getOnboardingCompleted(LOCAL_USER_ID)).resolves.toBe(true);
  });
});
