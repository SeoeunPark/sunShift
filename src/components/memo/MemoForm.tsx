"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShiftBadge } from "@/components/shift/ShiftBadge";
import { formatKoreanDateWithWeekday } from "@/lib/date/dateUtils";
import { getShiftForDate } from "@/lib/shift";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";
import { useMemoGroups } from "@/hooks/useMemoGroups";
import { useShiftSettings } from "@/hooks/useShiftSettings";

interface MemoFormProps {
  initialDate?: string;
}

export function MemoForm({ initialDate = "" }: MemoFormProps) {
  const { create, getByDate } = useMemoGroups();
  const { settings } = useShiftSettings();
  const shiftSettings = settings ?? DEFAULT_SHIFT_SETTINGS;

  const [date, setDate] = useState(initialDate);
  const [contentDraft, setContentDraft] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existing = date ? getByDate(date) : null;
  const content = contentDraft ?? existing?.content ?? "";
  const shift = date ? getShiftForDate(date, shiftSettings) : null;

  function handleDateChange(nextDate: string) {
    setDate(nextDate);
    setContentDraft(null);
    setMessage(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!date || !content.trim()) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await create({ date, content: content.trim() });
      setMessage(existing ? "메모가 수정되었습니다." : "메모가 저장되었습니다.");
      setContentDraft(null);
      if (!initialDate) {
        setDate("");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "메모 저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          {existing ? "메모 수정" : "메모 추가"}
        </h2>
        {date && (
          <Link
            href={`/calendar?date=${date}`}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <CalendarDays className="size-3.5" aria-hidden="true" />
            달력에서 보기
          </Link>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="memo-date">날짜</Label>
          <Input
            id="memo-date"
            type="date"
            value={date}
            onChange={(event) => handleDateChange(event.target.value)}
            required
          />
          {date && (
            <p className="text-xs text-muted-foreground">{formatKoreanDateWithWeekday(date)}</p>
          )}
        </div>

        {shift && (
          <div className="flex items-center gap-2 rounded-xl border bg-muted/40 px-3 py-2 text-sm">
            <span className="text-muted-foreground">근무</span>
            <ShiftBadge code={shift.code} size="sm" />
            <span>{shift.name}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="memo-content">내용</Label>
          <Textarea
            id="memo-content"
            value={content}
            onChange={(event) => setContentDraft(event.target.value)}
            placeholder="예: 병원, 약속, 개인 일정"
            required
          />
        </div>

        {existing && (
          <p className="text-sm text-muted-foreground">
            이 날짜에 저장된 메모가 있습니다. 저장하면 내용이 업데이트됩니다.
          </p>
        )}

        {message && (
          <p className="text-sm text-muted-foreground" role="status">
            {message}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "저장 중..." : existing ? "메모 수정" : "메모 저장"}
        </Button>
      </form>
    </section>
  );
}
