import { META_KEYS } from "@/lib/db/constants";
import { getMeta, setMeta } from "@/lib/db/initLocalDb";

function onboardingKey(userId: string): string {
  return `${META_KEYS.onboardingCompleted}:${userId}`;
}

/** Returns whether the user has finished first-run shift setup */
export async function getOnboardingCompleted(userId: string): Promise<boolean> {
  const completed = await getMeta(onboardingKey(userId));
  return completed === "true";
}

export async function setOnboardingCompleted(userId: string): Promise<void> {
  await setMeta(onboardingKey(userId), "true");
}

export async function clearOnboardingCompleted(userId: string): Promise<void> {
  await setMeta(onboardingKey(userId), "false");
}
