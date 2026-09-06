import { createId, nowIso, toShiftSettings } from "@/lib/db/mappers";
import type { ShiftSettings } from "@/lib/shift/shiftTypes";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";
import { enqueueSync } from "@/lib/sync";
import type { UpdateShiftSettingsInput } from "@/types/local";
import { localShiftSettingsStore } from "./local";

export class ShiftSettingsRepository {
  async get(userId: string): Promise<ShiftSettings> {
    const local = await localShiftSettingsStore.getByUserId(userId);
    if (local) {
      return toShiftSettings(local);
    }

    return {
      ...DEFAULT_SHIFT_SETTINGS,
      userId,
    };
  }

  async save(userId: string, input: UpdateShiftSettingsInput): Promise<ShiftSettings> {
    const current = await this.get(userId);
    const existing = await localShiftSettingsStore.getByUserId(userId);
    const timestamp = nowIso();

    const next = {
      id: existing?.id ?? createId(),
      userId,
      groupNumber: input.groupNumber ?? current.groupNumber,
      baseDate: input.baseDate ?? current.baseDate,
      baseShift: input.baseShift ?? current.baseShift,
      patternId: input.patternId ?? current.patternId,
      shiftDefinitions: input.shiftDefinitions ?? current.shiftDefinitions,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
      syncStatus: "pending" as const,
    };

    await localShiftSettingsStore.put(next);

    await enqueueSync(userId, {
      operation: "upsert",
      entity: "shift_settings",
      entityId: next.id,
      payload: next,
    });

    return toShiftSettings(next);
  }
}

export const shiftSettingsRepository = new ShiftSettingsRepository();
