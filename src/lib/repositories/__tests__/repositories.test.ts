import { beforeEach, describe, expect, it } from "vitest";
import { LOCAL_USER_ID } from "@/lib/db/constants";
import { shiftDb } from "@/lib/db/shiftDb";
import { leaveRepository } from "@/lib/repositories/LeaveRepository";
import { shiftSettingsRepository } from "@/lib/repositories/ShiftSettingsRepository";
import { memoRepository } from "@/lib/repositories/MemoRepository";
import { notificationRepository } from "@/lib/repositories/NotificationRepository";

async function clearDatabase() {
  await shiftDb.delete();
  await shiftDb.open();
}

describe("ShiftSettingsRepository", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it("seeds and returns default shift settings for local user", async () => {
    const settings = await shiftSettingsRepository.get(LOCAL_USER_ID);

    expect(settings.baseDate).toBe("2026-09-02");
    expect(settings.baseShift).toBe("B");
    expect(settings.groupNumber).toBe(4);
    expect(settings.shiftDefinitions).toHaveLength(4);
  });

  it("persists updated shift settings locally", async () => {
    await shiftSettingsRepository.save(LOCAL_USER_ID, {
      baseDate: "2026-10-01",
      baseShift: "A",
    });

    const settings = await shiftSettingsRepository.get(LOCAL_USER_ID);
    expect(settings.baseDate).toBe("2026-10-01");
    expect(settings.baseShift).toBe("A");
  });
});

describe("LeaveRepository", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it("creates and lists leave records", async () => {
    const created = await leaveRepository.create(LOCAL_USER_ID, {
      date: "2026-09-18",
      memo: "개인 연차",
    });

    expect(created.date).toBe("2026-09-18");
    expect(created.memo).toBe("개인 연차");

    const all = await leaveRepository.getAll(LOCAL_USER_ID);
    expect(all).toHaveLength(1);
  });

  it("updates leave record by id", async () => {
    const created = await leaveRepository.create(LOCAL_USER_ID, {
      date: "2026-09-20",
      memo: "병원",
    });

    const updated = await leaveRepository.update(LOCAL_USER_ID, created.id, {
      memo: "병원 재방문",
    });

    expect(updated.memo).toBe("병원 재방문");
  });

  it("deletes leave record", async () => {
    const created = await leaveRepository.create(LOCAL_USER_ID, {
      date: "2026-09-21",
      memo: null,
    });

    await leaveRepository.delete(LOCAL_USER_ID, created.id);
    const all = await leaveRepository.getAll(LOCAL_USER_ID);
    expect(all).toHaveLength(0);
  });
});

describe("MemoRepository", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it("creates memo for a date", async () => {
    const memo = await memoRepository.create(LOCAL_USER_ID, {
      date: "2026-09-25",
      content: "약속",
    });

    expect(memo.content).toBe("약속");

    const found = await memoRepository.getAll(LOCAL_USER_ID);
    expect(found).toHaveLength(1);
  });
});

describe("NotificationRepository", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it("returns default notification and sleep settings", async () => {
    const settings = await notificationRepository.getSettings(LOCAL_USER_ID);
    const sleepSettings = await notificationRepository.getSleepSettings(LOCAL_USER_ID);

    expect(settings.todayEnabled).toBe(true);
    expect(settings.todayTime).toBe("07:00");
    expect(sleepSettings).toHaveLength(3);
    expect(sleepSettings.find((item) => item.shiftCode === "C")?.notificationTime).toBe("08:00");
  });

  it("updates notification settings locally", async () => {
    const updated = await notificationRepository.updateSettings(LOCAL_USER_ID, {
      todayTime: "06:30",
      beforeShiftMinutes: 90,
    });

    expect(updated.todayTime).toBe("06:30");
    expect(updated.beforeShiftMinutes).toBe(90);
  });
});

describe("Local cache isolation by user", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it("keeps separate shift settings per user id", async () => {
    await shiftSettingsRepository.save(LOCAL_USER_ID, { baseShift: "B" });
    await shiftSettingsRepository.save("user-abc", { baseShift: "A" });

    const localSettings = await shiftSettingsRepository.get(LOCAL_USER_ID);
    const remoteUserSettings = await shiftSettingsRepository.get("user-abc");

    expect(localSettings.baseShift).toBe("B");
    expect(remoteUserSettings.baseShift).toBe("A");
  });
});
