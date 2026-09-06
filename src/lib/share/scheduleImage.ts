import type { ShiftResult } from "@/lib/shift/shiftTypes";
import { formatMonthYear, getCalendarDays, getWeekdayLabels } from "@/lib/date/calendarUtils";
import { LEAVE_CANVAS_COLOR, SHIFT_CANVAS_COLORS } from "@/lib/theme/shiftCanvasColors";
import type { ScheduleShareInput } from "./scheduleText";

const CELL_SIZE = 96;
const HEADER_HEIGHT = 72;
const PADDING = 32;
const COLS = 7;

export async function createScheduleShareImage(input: ScheduleShareInput): Promise<Blob> {
  const { year, month, scheduleByDate, leaveDates } = input;
  const days = getCalendarDays(year, month);
  const rows = Math.ceil(days.length / COLS);
  const width = PADDING * 2 + COLS * CELL_SIZE;
  const height = PADDING * 2 + HEADER_HEIGHT + rows * CELL_SIZE;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not supported");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);

  context.fillStyle = "#171717";
  context.font = "bold 28px system-ui, sans-serif";
  context.fillText(`SHIFT ${formatMonthYear(year, month)}`, PADDING, PADDING + 24);

  context.fillStyle = "#737373";
  context.font = "16px system-ui, sans-serif";
  context.fillText("4조 교대근무표", PADDING, PADDING + 52);

  const weekdays = getWeekdayLabels();
  context.font = "bold 14px system-ui, sans-serif";
  weekdays.forEach((label, index) => {
    const x = PADDING + index * CELL_SIZE + CELL_SIZE / 2;
    context.fillStyle = index === 0 ? "#ef4444" : index === 6 ? "#3b82f6" : "#525252";
    context.textAlign = "center";
    context.fillText(label, x, PADDING + HEADER_HEIGHT - 12);
  });
  context.textAlign = "left";

  days.forEach((day, index) => {
    const row = Math.floor(index / COLS);
    const col = index % COLS;
    const x = PADDING + col * CELL_SIZE;
    const y = PADDING + HEADER_HEIGHT + row * CELL_SIZE;
    const shift = scheduleByDate.get(day.date);
    const hasLeave = leaveDates.has(day.date);

    drawDayCell(context, {
      x,
      y,
      day: day.day,
      inCurrentMonth: day.inCurrentMonth,
      shift,
      hasLeave,
    });
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to create image"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

function drawDayCell(
  context: CanvasRenderingContext2D,
  options: {
    x: number;
    y: number;
    day: number;
    inCurrentMonth: boolean;
    shift?: ShiftResult;
    hasLeave: boolean;
  },
) {
  const { x, y, day, inCurrentMonth, shift, hasLeave } = options;
  const innerPadding = 6;
  const cellInnerSize = CELL_SIZE - innerPadding * 2;

  context.fillStyle = inCurrentMonth ? "#fafafa" : "#f5f5f5";
  context.fillRect(x + innerPadding, y + innerPadding, cellInnerSize, cellInnerSize);

  context.strokeStyle = "#e5e5e5";
  context.strokeRect(x + innerPadding, y + innerPadding, cellInnerSize, cellInnerSize);

  context.fillStyle = inCurrentMonth ? "#171717" : "#a3a3a3";
  context.font = "bold 16px system-ui, sans-serif";
  context.fillText(String(day), x + innerPadding + 8, y + innerPadding + 22);

  if (!inCurrentMonth || !shift) {
    return;
  }

  const colors =
    shift.code === "OFF"
      ? SHIFT_CANVAS_COLORS.OFF
      : SHIFT_CANVAS_COLORS[shift.code as "A" | "B" | "C"];

  context.fillStyle = colors.background;
  context.fillRect(x + innerPadding + 8, y + innerPadding + 30, cellInnerSize - 16, 28);

  context.fillStyle = colors.foreground;
  context.font = "bold 14px system-ui, sans-serif";
  context.fillText(shift.code, x + innerPadding + 16, y + innerPadding + 50);

  if (hasLeave) {
    context.fillStyle = LEAVE_CANVAS_COLOR;
    context.beginPath();
    context.arc(x + innerPadding + cellInnerSize - 12, y + innerPadding + 14, 5, 0, Math.PI * 2);
    context.fill();
  }
}
