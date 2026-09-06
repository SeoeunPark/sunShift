import type { OffDayBlock } from "@/lib/shift/shiftTypes";
import { formatKoreanDate } from "./dateUtils";

/** Format off block range: 9월 8일 ~ 9월 9일 */
export function formatOffBlockRange(block: OffDayBlock): string {
  if (block.startDate === block.endDate) {
    return formatKoreanDate(block.startDate);
  }
  return `${formatKoreanDate(block.startDate)} ~ ${formatKoreanDate(block.endDate)}`;
}
