import type { ShiftDefinitionRow, ShiftSettingsRow } from "@/types/database";
import type { ShiftCode, ShiftSettings } from "@/lib/shift/shiftTypes";

function trimTime(value: string | null): string | null {
  if (!value) {
    return null;
  }
  return value.slice(0, 5);
}

export function mapShiftDefinitions(rows: ShiftDefinitionRow[]): ShiftSettings["shiftDefinitions"] {
  return rows
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map((row) => ({
      code: row.code as ShiftCode,
      name: row.name,
      label: row.label,
      startTime: trimTime(row.start_time),
      endTime: trimTime(row.end_time),
      displayOrder: row.display_order,
    }));
}

export function mapShiftSettingsRow(
  settingsRow: ShiftSettingsRow,
  definitionRows: ShiftDefinitionRow[],
): ShiftSettings {
  return {
    id: settingsRow.id,
    userId: settingsRow.user_id,
    groupNumber: settingsRow.group_number,
    baseDate: settingsRow.base_date,
    baseShift: settingsRow.base_shift,
    patternId: settingsRow.pattern_id,
    shiftDefinitions: mapShiftDefinitions(definitionRows),
  };
}

export function mapShiftSettingsToRow(settings: ShiftSettings): Omit<ShiftSettingsRow, "created_at" | "updated_at"> {
  return {
    id: settings.id ?? "",
    user_id: settings.userId ?? "",
    group_number: settings.groupNumber,
    base_date: settings.baseDate,
    base_shift: settings.baseShift === "OFF" ? "B" : settings.baseShift,
    pattern_id: settings.patternId,
  };
}

export function mapShiftDefinitionToRow(
  definition: ShiftSettings["shiftDefinitions"][number],
  shiftSettingsId: string,
): Omit<ShiftDefinitionRow, "id" | "created_at" | "updated_at"> {
  return {
    shift_settings_id: shiftSettingsId,
    code: definition.code,
    name: definition.name,
    label: definition.label,
    start_time: definition.startTime,
    end_time: definition.endTime,
    display_order: definition.displayOrder,
  };
}
