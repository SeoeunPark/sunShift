"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppCard } from "@/components/ui/AppCard";
import { ShiftBadge } from "@/components/shift/ShiftBadge";
import { useLeave } from "@/hooks/useLeave";
import { useLeaveRestAnalysis } from "@/hooks/useLeaveRestAnalysis";
import {
  DEFAULT_LEAVE_TYPE,
  LEAVE_TYPES,
  type LeaveType,
} from "@/lib/leave/leaveTypes";
import { cn } from "@/lib/utils";

interface LeaveFormProps {
  initialDate?: string;
  compact?: boolean;
}

export function LeaveForm({ initialDate = "", compact = false }: LeaveFormProps) {
  const { create, getByDate } = useLeave();
  const [date, setDate] = useState(initialDate);
  const [type, setType] = useState<LeaveType>(DEFAULT_LEAVE_TYPE);
  const [memoDraft, setMemoDraft] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const restAnalysis = useLeaveRestAnalysis(date || null);
  const existing = date ? getByDate(date) : null;
  const memo = memoDraft ?? existing?.memo ?? "";

  function handleDateChange(nextDate: string) {
    setDate(nextDate);
    setMemoDraft(null);
    const nextExisting = nextDate ? getByDate(nextDate) : null;
    setType(nextExisting?.type ?? DEFAULT_LEAVE_TYPE);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!date) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await create({ date, type, memo: memo.trim() || null });
      const typeLabel = LEAVE_TYPES.find((item) => item.id === type)?.label ?? "휴가";
      setMessage(existing ? `${typeLabel}가 수정되었습니다.` : `${typeLabel}가 등록되었습니다.`);
      setMemoDraft(null);
      if (!initialDate) {
        setDate("");
        setType(DEFAULT_LEAVE_TYPE);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "휴가 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const typeSelector = (
    <div className="grid grid-cols-2 gap-1.5">
      {LEAVE_TYPES.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setType(item.id)}
          className={cn(
            "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
            type === item.id
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-background text-muted-foreground",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );

  if (compact) {
    return (
      <AppCard as="section" className="shrink-0 p-3">
        <h2 className="mb-2 text-xs font-semibold text-foreground">휴가 등록</h2>

        <form onSubmit={handleSubmit} className="space-y-2">
          {typeSelector}

          <Input
            id="leave-date"
            type="date"
            value={date}
            onChange={(event) => handleDateChange(event.target.value)}
            required
            className="h-9 w-full min-w-0 text-sm"
            suppressHydrationWarning
          />

          <Input
            id="leave-memo"
            value={memo}
            onChange={(event) => setMemoDraft(event.target.value)}
            placeholder="메모 (선택)"
            className="h-9 w-full min-w-0 text-sm"
          />

          <Button type="submit" className="h-9 w-full" disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : existing ? "수정" : "등록"}
          </Button>

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
      <h2 className="mb-4 text-sm font-medium text-muted-foreground">휴가 등록</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>휴가 종류</Label>
          {typeSelector}
        </div>

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
              휴가 전후 OFF 포함 <strong>총 {restAnalysis.totalRestDays}일 휴식</strong>
            </p>
            <p className="mt-1 text-muted-foreground">{restAnalysis.rangeLabel}</p>
          </div>
        )}

        {existing && (
          <p className="text-sm text-muted-foreground">
            이 날짜에 이미 휴가가 등록되어 있습니다. 저장하면 종류와 메모가 업데이트됩니다.
          </p>
        )}

        {message && (
          <p className="text-sm text-muted-foreground" role="status">
            {message}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "등록 중..." : existing ? "휴가 수정" : "휴가 등록"}
        </Button>
      </form>
    </section>
  );
}
