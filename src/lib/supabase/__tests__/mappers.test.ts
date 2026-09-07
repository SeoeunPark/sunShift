import { describe, expect, it } from "vitest";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";
import {
  mapShiftDefinitions,
  mapShiftSettingsRow,
  mapShiftSettingsToRow,
} from "../mappers";
import type { ShiftDefinitionRow, ShiftSettingsRow } from "@/types/database";

const settingsRow: ShiftSettingsRow = {
  id: "settings-1",
  user_id: "user-1",
  group_number: 4,
  base_date: "2026-09-02",
  base_shift: "B",
  pattern_id: "four-group-6-2",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const definitionRows: ShiftDefinitionRow[] = DEFAULT_SHIFT_SETTINGS.shiftDefinitions.map(
  (definition, index) => ({
    id: `def-${index}`,
    shift_settings_id: "settings-1",
    code: definition.code,
    name: definition.name,
    label: definition.label,
    start_time: definition.startTime ? `${definition.startTime}:00` : null,
    end_time: definition.endTime ? `${definition.endTime}:00` : null,
    display_order: definition.displayOrder,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  }),
);

describe("mapShiftDefinitions", () => {
  it("maps DB rows to shift definitions with trimmed times", () => {
    const result = mapShiftDefinitions(definitionRows);
    expect(result).toHaveLength(4);
    expect(result[0]).toMatchObject({
      code: "A",
      startTime: "07:00",
      endTime: "15:00",
    });
    expect(result[3].startTime).toBeNull();
  });
});

describe("mapShiftSettingsRow", () => {
  it("maps settings and definitions to ShiftSettings", () => {
    const result = mapShiftSettingsRow(settingsRow, definitionRows);
    expect(result).toMatchObject({
      id: "settings-1",
      userId: "user-1",
      groupNumber: 4,
      baseDate: "2026-09-02",
      baseShift: "B",
      patternId: "four-group-6-2",
    });
    expect(result.shiftDefinitions).toHaveLength(4);
  });
});

describe("mapShiftSettingsToRow", () => {
  it("maps ShiftSettings back to DB row shape", () => {
    const result = mapShiftSettingsToRow({
      ...DEFAULT_SHIFT_SETTINGS,
      id: "settings-1",
      userId: "user-1",
    });

    expect(result).toMatchObject({
      id: "settings-1",
      user_id: "user-1",
      group_number: 4,
      base_date: "2026-09-10",
      base_shift: "C",
      pattern_id: "four-group-6-2",
    });
  });
});
