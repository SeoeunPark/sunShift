import type { ShiftResult } from "@/lib/shift/shiftTypes";
import { formatMonthYear, getCalendarDays, getWeekdayLabels } from "@/lib/date/calendarUtils";
import { LEAVE_CANVAS_COLOR, SHIFT_CANVAS_COLORS } from "@/lib/theme/shiftCanvasColors";
import type { ScheduleShareInput } from "./scheduleText";

const CELL_SIZE = 96;
const HEADER_HEIGHT = 80;
const PADDING = 32;
const COLS = 7;
const LOGO_PATH = "/icons/icon-192.png";
const LOGO_SIZE = 52;

function getExportScale(): number {
  if (typeof window === "undefined") {
    return 1;
  }

  return Math.min(Math.max(window.devicePixelRatio || 1, 1), 2);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load logo image"));
    image.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      try {
        const dataUrl = canvas.toDataURL("image/png");
        const base64 = dataUrl.split(",")[1];
        if (!base64) {
          reject(new Error("Failed to create image"));
          return;
        }

        const binary = atob(base64);
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        resolve(new Blob([bytes], { type: "image/png" }));
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Failed to create image"));
      }
    }, "image/png");
  });
}

export async function createScheduleShareImage(input: ScheduleShareInput): Promise<Blob> {
  const { year, month, scheduleByDate, leaveDates } = input;
  const days = getCalendarDays(year, month);
  const rows = Math.ceil(days.length / COLS);
  const width = PADDING * 2 + COLS * CELL_SIZE;
  const height = PADDING * 2 + HEADER_HEIGHT + rows * CELL_SIZE;
  const scale = getExportScale();

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not supported");
  }

  context.scale(scale, scale);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  if (typeof document !== "undefined" && "fonts" in document) {
    await document.fonts.ready;
  }

  const logo = await loadImage(
    typeof window !== "undefined"
      ? new URL(LOGO_PATH, window.location.origin).toString()
      : LOGO_PATH,
  );

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);

  context.drawImage(logo, PADDING, PADDING, LOGO_SIZE, LOGO_SIZE);

  context.fillStyle = "#171717";
  context.font = '700 26px "Noto Sans KR", system-ui, -apple-system, sans-serif';
  context.fillText(formatMonthYear(year, month), PADDING + LOGO_SIZE + 14, PADDING + 30);

  context.fillStyle = "#737373";
  context.font = '500 15px "Noto Sans KR", system-ui, -apple-system, sans-serif';
  context.fillText("4조 교대근무표", PADDING + LOGO_SIZE + 14, PADDING + 54);

  const weekdays = getWeekdayLabels();
  context.font = '700 14px "Noto Sans KR", system-ui, -apple-system, sans-serif';
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

  return canvasToBlob(canvas);
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
  context.font = '700 16px "Noto Sans KR", system-ui, -apple-system, sans-serif';
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
  context.font = '700 14px "Noto Sans KR", system-ui, -apple-system, sans-serif';
  context.fillText(shift.code, x + innerPadding + 16, y + innerPadding + 50);

  if (hasLeave) {
    context.fillStyle = LEAVE_CANVAS_COLOR;
    context.beginPath();
    context.arc(x + innerPadding + cellInnerSize - 12, y + innerPadding + 14, 5, 0, Math.PI * 2);
    context.fill();
  }
}
