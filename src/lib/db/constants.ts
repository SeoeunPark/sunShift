/** Anonymous local user id when not logged in */
export const LOCAL_USER_ID = "local";

export const DB_NAME = "shift-db";
export const DB_VERSION = 2;

export const META_KEYS = {
  activeUserId: "activeUserId",
  dbInitialized: "dbInitialized",
  lastSyncedAt: "lastSyncedAt",
  onboardingCompleted: "onboardingCompleted",
} as const;
