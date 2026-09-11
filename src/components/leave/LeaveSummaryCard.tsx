"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppCard } from "@/components/ui/AppCard";
import { Skeleton } from "@/components/ui/skeleton";
import { LEAVE_TYPES, type LeaveType } from "@/lib/leave/leaveTypes";
import { useLeaveBalances } from "@/hooks/useLeaveBalance";

interface LeaveSummaryCardProps {
  compact?: boolean;
}

function LeaveBalanceRow({
  label,
  total,
  used,
  remaining,
  isEditing,
  draftTotal,
  onDraftChange,
  onEdit,
  onSave,
  onCancel,
}: {
  label: string;
  total: number;
  used: number;
  remaining: number;
  isEditing: boolean;
  draftTotal: string;
  onDraftChange: (value: string) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const usedPercent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums tracking-tight text-primary">
            {remaining}
            <span className="text-sm font-semibold text-muted-foreground">/{total}일</span>
          </p>
          <p className="text-[10px] text-muted-foreground">잔여 · 사용 {used}일</p>
        </div>
        {!isEditing && (
          <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label={`${label} 총량 수정`}>
            <Pencil className="size-3.5" />
          </Button>
        )}
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-muted/80">
        <div
          className="h-full rounded-full bg-primary/70 transition-all"
          style={{ width: `${usedPercent}%` }}
        />
      </div>

      {isEditing && (
        <div className="space-y-1.5">
          <Input
            type="number"
            min={0}
            value={draftTotal}
            onChange={(event) => onDraftChange(event.target.value)}
            aria-label={`${label} 총 일수`}
            className="h-8 w-full min-w-0 text-sm"
          />
          <div className="flex gap-1.5">
            <Button size="sm" className="h-8 flex-1" onClick={onSave}>
              저장
            </Button>
            <Button variant="outline" size="sm" className="h-8 flex-1" onClick={onCancel}>
              취소
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function LeaveSummaryCard({ compact = false }: LeaveSummaryCardProps) {
  const { annual, nightCare, isLoading } = useLeaveBalances();
  const [editingType, setEditingType] = useState<LeaveType | null>(null);
  const [draftTotal, setDraftTotal] = useState("");

  function startEdit(type: LeaveType, total: number) {
    setEditingType(type);
    setDraftTotal(String(total));
  }

  async function handleSave(type: LeaveType) {
    const parsed = Number(draftTotal);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return;
    }

    if (type === "annual") {
      await annual.updateTotal(parsed);
    } else {
      await nightCare.updateTotal(parsed);
    }
    setEditingType(null);
  }

  if (isLoading) {
    return compact ? (
      <Skeleton className="h-[9rem] w-full shrink-0 rounded-2xl" />
    ) : (
      <section className="app-card p-6">
        <p className="text-sm text-muted-foreground">휴가 정보 불러오는 중...</p>
      </section>
    );
  }

  const rows = [
    { type: "annual" as const, label: LEAVE_TYPES[0].label, balance: annual },
    { type: "night_care" as const, label: LEAVE_TYPES[1].label, balance: nightCare },
  ];

  if (compact) {
    return (
      <AppCard variant="hero" as="section" className="relative shrink-0 space-y-3 p-3.5">
        {rows.map((row) => (
          <LeaveBalanceRow
            key={row.type}
            label={row.label}
            total={row.balance.total}
            used={row.balance.used}
            remaining={row.balance.remaining}
            isEditing={editingType === row.type}
            draftTotal={draftTotal}
            onDraftChange={setDraftTotal}
            onEdit={() => startEdit(row.type, row.balance.total)}
            onSave={() => void handleSave(row.type)}
            onCancel={() => setEditingType(null)}
          />
        ))}
      </AppCard>
    );
  }

  return (
    <section className="app-card space-y-5 p-6">
      <h2 className="text-sm font-medium text-muted-foreground">휴가 현황</h2>
      {rows.map((row) => (
        <LeaveBalanceRow
          key={row.type}
          label={row.label}
          total={row.balance.total}
          used={row.balance.used}
          remaining={row.balance.remaining}
          isEditing={editingType === row.type}
          draftTotal={draftTotal}
          onDraftChange={setDraftTotal}
          onEdit={() => startEdit(row.type, row.balance.total)}
          onSave={() => void handleSave(row.type)}
          onCancel={() => setEditingType(null)}
        />
      ))}
    </section>
  );
}
