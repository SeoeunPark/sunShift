"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShiftBadge } from "@/components/shift/ShiftBadge";
import { formatKoreanDateWithWeekday, getWeekdayIndex } from "@/lib/date/dateUtils";
import { getMemoDayLabel } from "@/lib/date/memoUtils";
import { getShiftForDate } from "@/lib/shift";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";
import type { MemoRecord } from "@/types/local";
import { cn } from "@/lib/utils";
import { useMemoGroups } from "@/hooks/useMemoGroups";
import { useShiftSettings } from "@/hooks/useShiftSettings";

interface MemoRecordItemProps {
  record: MemoRecord;
  today: string;
  isActive: boolean;
  onSelect: (date: string) => void;
  onRemove: (id: string) => Promise<void>;
}

function MemoRecordItem({ record, today, isActive, onSelect, onRemove }: MemoRecordItemProps) {
  const { settings } = useShiftSettings();
  const shiftSettings = settings ?? DEFAULT_SHIFT_SETTINGS;
  const shift = getShiftForDate(record.date, shiftSettings);
  const [isDeleting, setIsDeleting] = useState(false);
  const weekday = getWeekdayIndex(record.date);
  const dayLabel = getMemoDayLabel(record.date, today);

  async function handleDelete(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    setIsDeleting(true);
    try {
      await onRemove(record.id);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(record.date)}
        className={cn(
          "flex w-full items-start justify-between gap-3 rounded-xl border p-4 text-left transition-colors",
          isActive ? "border-primary bg-primary/5" : "hover:bg-muted/40",
        )}
      >
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                "font-medium",
                weekday === 0 && "text-red-500",
                weekday === 6 && "text-blue-500",
              )}
            >
              {formatKoreanDateWithWeekday(record.date)}
            </p>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {dayLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShiftBadge code={shift.code} size="sm" />
            <span className="text-xs text-muted-foreground">{shift.name}</span>
          </div>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{record.content}</p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(event) => void handleDelete(event)}
          disabled={isDeleting}
          aria-label="메모 삭제"
        >
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </button>
    </li>
  );
}

interface MemoRecordListProps {
  activeDate?: string;
  onSelect: (date: string) => void;
}

function MemoRecordSection({
  title,
  records,
  today,
  activeDate,
  onSelect,
  onRemove,
  emptyMessage,
}: {
  title: string;
  records: MemoRecord[];
  today: string;
  activeDate?: string;
  onSelect: (date: string) => void;
  onRemove: (id: string) => Promise<void>;
  emptyMessage?: string;
}) {
  if (records.length === 0) {
    if (!emptyMessage) {
      return null;
    }

    return (
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-medium text-muted-foreground">{title}</h2>
      <ul className="space-y-3">
        {records.map((record) => (
          <MemoRecordItem
            key={record.id}
            record={record}
            today={today}
            isActive={activeDate === record.date}
            onSelect={onSelect}
            onRemove={onRemove}
          />
        ))}
      </ul>
    </section>
  );
}

export function MemoRecordList({ activeDate, onSelect }: MemoRecordListProps) {
  const { upcoming, past, total, isLoading, today, remove } = useMemoGroups();

  if (isLoading) {
    return (
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">목록 불러오는 중...</p>
      </section>
    );
  }

  if (total === 0) {
    return (
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">저장된 메모</h2>
        <p className="text-sm text-muted-foreground">저장된 메모가 없습니다.</p>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <MemoRecordSection
        title="다가오는 메모"
        records={upcoming}
        today={today}
        activeDate={activeDate}
        onSelect={onSelect}
        onRemove={remove}
        emptyMessage="다가오는 메모가 없습니다."
      />
      <MemoRecordSection
        title="지난 메모"
        records={past}
        today={today}
        activeDate={activeDate}
        onSelect={onSelect}
        onRemove={remove}
      />
    </div>
  );
}
