"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingCard } from "@/components/ui/LoadingCard";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useShiftSettings } from "@/hooks/useShiftSettings";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";
import type { ShiftCode } from "@/lib/shift/shiftTypes";
import { cn } from "@/lib/utils";

const GROUP_OPTIONS = [1, 2, 3, 4] as const;
const SHIFT_OPTIONS: ShiftCode[] = ["A", "B", "C"];

interface ShiftSetupFormProps {
  mode?: "onboarding" | "edit";
}

export function ShiftSetupForm({ mode = "onboarding" }: ShiftSetupFormProps) {
  const router = useRouter();
  const { settings, isLoading, save } = useShiftSettings();
  const { complete } = useOnboardingStatus();
  const defaults = settings ?? DEFAULT_SHIFT_SETTINGS;

  const [groupNumber, setGroupNumber] = useState<number | null>(null);
  const [baseDate, setBaseDate] = useState<string | null>(null);
  const [baseShift, setBaseShift] = useState<ShiftCode | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedGroup = groupNumber ?? defaults.groupNumber;
  const resolvedDate = baseDate ?? defaults.baseDate;
  const resolvedShift = baseShift ?? defaults.baseShift;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      await save({
        groupNumber: resolvedGroup,
        baseDate: resolvedDate,
        baseShift: resolvedShift,
      });
      await complete();
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "설정을 저장하지 못했습니다.");
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <LoadingCard lines={4} />;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="group-number">몇 조인가요?</Label>
          <div className="grid grid-cols-4 gap-2">
            {GROUP_OPTIONS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setGroupNumber(value)}
                className={cn(
                  "h-11 rounded-xl border text-sm font-medium transition-colors active:scale-[0.98]",
                  resolvedGroup === value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted",
                )}
              >
                {value}조
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
        <div className="space-y-2">
          <Label htmlFor="base-date">기준일은 언제인가요?</Label>
          <Input
            id="base-date"
            type="date"
            value={resolvedDate}
            onChange={(event) => setBaseDate(event.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            교대 패턴 계산의 시작점이 되는 날짜입니다.
          </p>
        </div>

        <div className="space-y-2">
          <Label>기준일에 무슨 조였나요?</Label>
          <div className="grid grid-cols-3 gap-2">
            {SHIFT_OPTIONS.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setBaseShift(code)}
                className={cn(
                  "h-11 rounded-xl border text-sm font-medium transition-colors active:scale-[0.98]",
                  resolvedShift === code
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted",
                )}
              >
                {code}조
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-muted/40 p-6">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">근무 시간 (기본값)</h2>
        <dl className="space-y-2 text-sm">
          {defaults.shiftDefinitions
            .filter((item) => item.code !== "OFF")
            .map((item) => (
              <div key={item.code} className="flex justify-between">
                <dt>{item.name}</dt>
                <dd>
                  {item.startTime} ~ {item.endTime}
                </dd>
              </div>
            ))}
        </dl>
      </section>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="h-12 w-full text-base" disabled={isSaving}>
        {isSaving ? "저장 중..." : mode === "edit" ? "설정 저장" : "시작하기"}
      </Button>
    </form>
  );
}
