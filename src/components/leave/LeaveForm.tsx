"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppCard } from "@/components/ui/AppCard";
import { ShiftBadge } from "@/components/shift/ShiftBadge";
import { useLeave } from "@/hooks/useLeave";
import { useLeaveRestAnalysis } from "@/hooks/useLeaveRestAnalysis";

interface LeaveFormProps {
  initialDate?: string;
  compact?: boolean;
}

export function LeaveForm({ initialDate = "", compact = false }: LeaveFormProps) {
  const { create, getByDate } = useLeave();
  const [date, setDate] = useState(initialDate);
  const [memoDraft, setMemoDraft] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const restAnalysis = useLeaveRestAnalysis(date || null);
  const existing = date ? getByDate(date) : null;
  const memo = memoDraft ?? existing?.memo ?? "";

  function handleDateChange(nextDate: string) {
    setDate(nextDate);
    setMemoDraft(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!date) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await create({ date, memo: memo.trim() || null });
      setMessage(existing ? "연차가 수정되었습니다." : "연차가 등록되었습니다.");
      setMemoDraft(null);
      if (!initialDate) {
        setDate("");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "연차 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (compact) {
    return (
      <AppCard as="section" className="shrink-0 p-3">
        <h2 className="mb-2 text-xs font-semibold text-foreground">연차 등록</h2>

        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="grid grid-cols-[1fr_auto] gap-1.5">
            <Input
              id="leave-date"
              type="date"
              value={date}
              onChange={(event) => handleDateChange(event.target.value)}
              required
              className="h-9 text-sm"
              suppressHydrationWarning
            />
            <Button type="submit" className="h-9 px-4" disabled={isSubmitting}>
              {isSubmitting ? "..." : existing ? "수정" : "등록"}
            </Button>
          </div>

          <Input
            id="leave-memo"
            value={memo}
            onChange={(event) => setMemoDraft(event.target.value)}
            placeholder="메모 (선택)"
            className="h-9 text-sm"
          />

          {restAnalysis && (
            <div className="app-card-inset flex flex-wrap items-center gap-x-2 gap-y-1 px-2.5 py-2 text-[11px]">
              <span className="text-muted-foreground">원래</span>
              <ShiftBadge code={restAnalysis.originalShift.code} size="sm" />
              <span className="font-medium">휴식 {restAnalysis.totalRestDays}일</span>
              <span className="text-muted-foreground">({restAnalysis.rangeLabel})</span>
            </div>
          )}

          {message && (
            <p className="text-[11px] text-muted-foreground" role="status">
              {message}
            </p>
          )}
        </form>
      </AppCard>
    );
  }

  return (
    <section className="app-card p-6">
      <h2 className="mb-4 text-sm font-medium text-muted-foreground">연차 등록</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="leave-date">날짜</Label>
          <Input
            id="leave-date"
            type="date"
            value={date}
            onChange={(event) => handleDateChange(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="leave-memo">메모</Label>
          <Input
            id="leave-memo"
            value={memo}
            onChange={(event) => setMemoDraft(event.target.value)}
            placeholder="예: 병원, 개인 사유"
          />
        </div>

        {restAnalysis && (
          <div className="rounded-xl border bg-muted/40 p-4 text-sm">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-muted-foreground">원래 근무</span>
              <ShiftBadge code={restAnalysis.originalShift.code} size="sm" />
              <span>{restAnalysis.originalShift.name}</span>
            </div>
            <p>
              연차 전후 OFF 포함{" "}
              <strong>총 {restAnalysis.totalRestDays}일 휴식</strong>
            </p>
            <p className="mt-1 text-muted-foreground">{restAnalysis.rangeLabel}</p>
          </div>
        )}

        {existing && (
          <p className="text-sm text-muted-foreground">
            이 날짜에 이미 연차가 등록되어 있습니다. 저장하면 메모가 업데이트됩니다.
          </p>
        )}

        {message && (
          <p className="text-sm text-muted-foreground" role="status">
            {message}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "등록 중..." : existing ? "연차 수정" : "연차 등록"}
        </Button>
      </form>
    </section>
  );
}
