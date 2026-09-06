import { formatInTimeZone } from "date-fns-tz";
import { SEOUL_TIMEZONE } from "./dateUtils";

export function getTodaySeoul(): string {
  return formatInTimeZone(new Date(), SEOUL_TIMEZONE, "yyyy-MM-dd");
}

export function getCurrentSeoulMonth(): { year: number; month: number } {
  const today = getTodaySeoul();
  const [year, month] = today.split("-").map(Number);
  return { year, month };
}
