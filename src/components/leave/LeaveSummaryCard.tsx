"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppCard } from "@/components/ui/AppCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeaveBalance } from "@/hooks/useLeaveBalance";

interface LeaveSummaryCardProps {
  compact?: boolean;
}

export function LeaveSummaryCard({ compact = false }: LeaveSummaryCardProps) {
  const { total, used, remaining, updateTotal, isLoading } = useLeaveBalance();
  const [isEditing, setIsEditing] = useState(false);
  const [draftTotal, setDraftTotal] = useState(String(total));
  const usedPercent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

  async function handleSaveTotal() {
    const parsed = Number(draftTotal);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return;
    }
    await updateTotal(parsed);
    setIsEditing(false);
  }

  if (isLoading) {
    return compact ? (
      <Skeleton className="h-[5.5rem] w-full shrink-0 rounded-2xl" />
    ) : (
      <section className="app-card p-6">
        <p className="text-sm text-muted-foreground">연차 정보 불러오는 중...</p>
      </section>
    );
  }

  if (compact) {
    return (
      <AppCard variant="hero" as="section" className="relative shrink-0 p-3.5">
        <div className="relative flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">연차 현황</p>
            <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-primary">
              {remaining}
              <span className="text-base font-semibold text-muted-foreground">/{total}일</span>
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">잔여 · 사용 {used}일</p>
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setDraftTotal(String(total));
                setIsEditing(true);
              }}
              aria-label="총 연차 수정"
            >
              <Pencil className="size-3.5" />
            </Button>
          )}
        </div>

        <div className="relative mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted/80">
          <div
            className="h-full rounded-full bg-primary/70 transition-all"
            style={{ width: `${usedPercent}%` }}
          />
        </div>

        {isEditing && (
          <div className="relative mt-2.5 flex gap-1.5">
            <Input
              type="number"
              min={0}
              value={draftTotal}
              onChange={(event) => setDraftTotal(event.target.value)}
              aria-label="총 연차 일수"
              className="h-8 text-sm"
            />
            <Button size="sm" className="h-8 px-3" onClick={() => void handleSaveTotal()}>
              저장
            </Button>
            <Button variant="outline" size="sm" className="h-8 px-3" onClick={() => setIsEditing(false)}>
              취소
            </Button>
          </div>
        )}
      </AppCard>
    );
  }

  return (
    <section className="app-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">연차 현황</h2>
        {!isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDraftTotal(String(total));
              setIsEditing(true);
            }}
          >
            총량 수정
          </Button>
        ) : null}
      </div>

      {isEditing ? (
        <div className="mb-4 flex gap-2">
          <Input
            type="number"
            min={0}
            value={draftTotal}
            onChange={(event) => setDraftTotal(event.target.value)}
            aria-label="총 연차 일수"
          />
          <Button size="sm" onClick={() => void handleSaveTotal()}>
            저장
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
            취소
          </Button>
        </div>
      ) : null}

      <dl className="grid grid-cols-3 gap-3 text-center">
        <div className="stat-tile py-3">
          <dt className="text-xs text-muted-foreground">총 연차</dt>
          <dd className="mt-1 text-2xl font-bold tabular-nums">{total}일</dd>
        </div>
        <div className="stat-tile py-3">
          <dt className="text-xs text-muted-foreground">사용</dt>
          <dd className="mt-1 text-2xl font-bold tabular-nums">{used}일</dd>
        </div>
        <div className="stat-tile border-primary/20 bg-primary/[0.04] py-3">
          <dt className="text-xs text-muted-foreground">잔여</dt>
          <dd className="mt-1 text-2xl font-bold tabular-nums text-primary">{remaining}일</dd>
        </div>
      </dl>
    </section>
  );
}
