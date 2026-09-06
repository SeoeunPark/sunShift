"use client";

import type { OffDayBlock } from "@/lib/shift/shiftTypes";
import { formatOffBlockRange } from "@/lib/date/offDayUtils";
import { cn } from "@/lib/utils";

interface DaysOffBlockListProps {
  title: string;
  blocks: OffDayBlock[];
  emptyMessage?: string;
  highlightToday?: boolean;
  today?: string;
}

export function DaysOffBlockList({
  title,
  blocks,
  emptyMessage = "휴무 일정이 없습니다.",
  highlightToday = false,
  today,
}: DaysOffBlockListProps) {
  if (blocks.length === 0) {
    return (
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-medium text-muted-foreground">{title}</h2>
      <ul className="space-y-3">
        {blocks.map((block) => {
          const isActive =
            highlightToday &&
            today &&
            today >= block.startDate &&
            today <= block.endDate;

          return (
            <li
              key={`${block.startDate}-${block.endDate}`}
              className={cn(
                "flex items-center justify-between rounded-xl border px-4 py-3",
                isActive && "border-primary bg-primary/5",
              )}
            >
              <span className="font-medium">{formatOffBlockRange(block)}</span>
              <span className="text-sm text-muted-foreground">{block.days}일</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
