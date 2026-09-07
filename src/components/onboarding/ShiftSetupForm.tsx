"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LoadingCard } from "@/components/ui/LoadingCard";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useShiftSettings } from "@/hooks/useShiftSettings";
import {
  formatGroupPresetLongLabel,
  getGroupShiftPreset,
  GROUP_NUMBERS,
  isGroupNumber,
} from "@/lib/shift/groupPresets";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";
import { cn } from "@/lib/utils";

interface ShiftSetupFormProps {
  mode?: "onboarding" | "edit";
}

export function ShiftSetupForm({ mode = "onboarding" }: ShiftSetupFormProps) {
  const router = useRouter();
  const { settings, isLoading, save } = useShiftSettings();
  const { complete } = useOnboardingStatus();
  const defaults = settings ?? DEFAULT_SHIFT_SETTINGS;

  const [groupNumber, setGroupNumber] = useState<number | null>(
    mode === "edit" && isGroupNumber(defaults.groupNumber) ? defaults.groupNumber : null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedGroup = groupNumber;
  const selectedPreset =
    resolvedGroup !== null && isGroupNumber(resolvedGroup)
      ? getGroupShiftPreset(resolvedGroup)
      : null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (resolvedGroup === null || !isGroupNumber(resolvedGroup)) {
      setError("몇 조인지 선택해 주세요.");
      return;
    }

    const preset = getGroupShiftPreset(resolvedGroup);
    setIsSaving(true);

    try {
      await save({
        groupNumber: preset.groupNumber,
        baseDate: preset.baseDate,
        baseShift: preset.baseShift,
      });
      await complete();
      router.replace("/");
      router.refresh();
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
        <div className="space-y-3">
          <Label htmlFor="group-number">몇 조인가요?</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {GROUP_NUMBERS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setGroupNumber(value)}
                className={cn(
                  "h-14 rounded-xl border px-2 text-sm font-medium transition-colors active:scale-[0.98]",
                  resolvedGroup === value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted",
                )}
              >
                {value}조
              </button>
            ))}
          </div>
          {selectedPreset ? (
            <p className="text-sm text-muted-foreground">
              {formatGroupPresetLongLabel(selectedPreset.groupNumber)}
            </p>
          ) : null}
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

      <Button
        type="submit"
        className="h-12 w-full text-base"
        disabled={isSaving || resolvedGroup === null}
      >
        {isSaving ? "저장 중..." : mode === "edit" ? "설정 저장" : "시작하기"}
      </Button>
    </form>
  );
}
