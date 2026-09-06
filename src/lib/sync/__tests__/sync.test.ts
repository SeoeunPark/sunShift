import { beforeEach, describe, expect, it, vi } from "vitest";
import { LOCAL_USER_ID } from "@/lib/db/constants";
import { shiftDb } from "@/lib/db/shiftDb";
import { createDefaultShiftSettings } from "@/lib/db/mappers";
import { localShiftSettingsStore } from "@/lib/repositories/local";
import { migrateLocalUserToAuthUser } from "../syncPull";
import { syncQueueStore } from "../syncQueueStore";
import { enqueueSync } from "../syncService";

async function clearDatabase() {
  await shiftDb.delete();
  await shiftDb.open();
}

describe("syncQueueStore", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it("enqueues and deduplicates by user/entity/entityId", async () => {
    await syncQueueStore.enqueue({
      userId: "user-1",
      operation: "upsert",
      entity: "leave_record",
      entityId: "leave-1",
      payload: { date: "2026-09-18" },
    });

    await syncQueueStore.enqueue({
      userId: "user-1",
      operation: "upsert",
      entity: "leave_record",
      entityId: "leave-1",
      payload: { date: "2026-09-19" },
    });

    const pending = await syncQueueStore.getPending("user-1");
    expect(pending).toHaveLength(1);
    expect(JSON.parse(pending[0].payload).date).toBe("2026-09-19");
  });
});

describe("migrateLocalUserToAuthUser", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it("copies anonymous local shift settings to authenticated user", async () => {
    const localSettings = createDefaultShiftSettings(LOCAL_USER_ID);
    localSettings.baseShift = "A";
    await localShiftSettingsStore.put(localSettings);

    await migrateLocalUserToAuthUser("auth-user-1");

    const migrated = await localShiftSettingsStore.getByUserId("auth-user-1");
    expect(migrated).toBeDefined();
    expect(migrated?.baseShift).toBe("A");
    expect(migrated?.syncStatus).toBe("pending");
  });
});

describe("enqueueSync", () => {
  beforeEach(async () => {
    await clearDatabase();
    vi.restoreAllMocks();
  });

  it("does not enqueue for local anonymous user", async () => {
    await enqueueSync(LOCAL_USER_ID, {
      operation: "upsert",
      entity: "shift_settings",
      entityId: "settings-1",
      payload: {},
    });

    const pending = await syncQueueStore.getPending(LOCAL_USER_ID);
    expect(pending).toHaveLength(0);
  });
});
