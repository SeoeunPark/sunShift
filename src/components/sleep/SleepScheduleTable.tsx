"use client";

import { useMemo, useState } from "react";
import { Moon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PAGE_VIEWPORT_HEIGHT } from "@/lib/layout/viewport";
import {
  formatCompactTimeRange,
  getAllSleepSchedules,
  getRecommendedSleepNow,
  type RecommendedSleep,
  type SleepScheduleKey,
} from "@/lib/sleep/sleepSchedule";
import { getShiftForDate } from "@/lib/shift";
import {
  DEFAULT_SHIFT_DEFINITIONS,
  DEFAULT_SHIFT_SETTINGS,
} from "@/lib/shift/shiftPattern";
import { useSeoulToday } from "@/hooks/useClientOnly";
import { useShiftSettings } from "@/hooks/useShiftSettings";
import { cn } from "@/lib/utils";

type MainShiftCode = "A" | "B" | "C";

const MAIN_SHIFT_CODES: MainShiftCode[] = ["A", "B", "C"];

const TRANSITION_KEYS = ["A_TO_B", "B_OFF_1", "B_OFF_2", "C_TO_A"] as const satisfies readonly SleepScheduleKey[];

const TRANSITION_LABELS: Record<(typeof TRANSITION_KEYS)[number], string> = {
  A_TO_B: "A → B",
  B_OFF_1: "B 휴무 1일차",
  B_OFF_2: "B 휴무 2일차",
  C_TO_A: "C → A",
};

const WORK_BY_CODE = Object.fromEntries(
  DEFAULT_SHIFT_DEFINITIONS.filter((item) => item.code !== "OFF").map((item) => [
    item.code,
    { name: item.name, label: item.label, hours: `${item.startTime} ~ ${item.endTime}` },
  ]),
) as Record<MainShiftCode, { name: string; label: string; hours: string }>;

function isMainShiftKey(key: SleepScheduleKey): key is MainShiftCode {
  return MAIN_SHIFT_CODES.includes(key as MainShiftCode);
}

function formatHeroSleepRange(bedTime: string, wakeTime: string): string {
  const bed = bedTime.slice(0, 5);
  const wake = wakeTime.slice(0, 5);
  const [bedHour] = bedTime.split(":").map(Number);
  const [wakeHour] = wakeTime.split(":").map(Number);

  if (wakeHour <= bedHour) {
    return `${bed} — 익일 ${wake}`;
  }

  return `${bed} — ${wake}`;
}

function getSleepDurationLabel(bedTime: string, wakeTime: string): string {
  const [bedHour, bedMinute] = bedTime.split(":").map(Number);
  const [wakeHour, wakeMinute] = wakeTime.split(":").map(Number);
  const bedTotal = bedHour * 60 + bedMinute;
  let wakeTotal = wakeHour * 60 + wakeMinute;

  if (wakeTotal <= bedTotal) {
    wakeTotal += 24 * 60;
  }

  const hours = Math.round((wakeTotal - bedTotal) / 60);
  return `${hours}시간 수면`;
}

function SleepTimeDisplay({
  bedTime,
  wakeTime,
  size = "md",
  className,
}: {
  bedTime: string;
  wakeTime: string;
  size?: "lg" | "md" | "sm";
  className?: string;
}) {
  const sizeClass =
    size === "lg"
      ? "text-[clamp(1.25rem,5vw,1.5rem)] font-bold tracking-tight"
      : size === "md"
        ? "text-lg font-bold tracking-tight"
        : "text-sm font-semibold";

  return (
    <p className={cn("tabular-nums text-sleep-foreground", sizeClass, className)}>
      {formatHeroSleepRange(bedTime, wakeTime)}
    </p>
  );
}

function ShiftSegmentedControl({
  value,
  onChange,
}: {
  value: MainShiftCode;
  onChange: (code: MainShiftCode) => void;
}) {
  return (
    <div
      className="flex rounded-xl bg-muted/45 p-1"
      role="tablist"
      aria-label="교대별 수면"
    >
      {MAIN_SHIFT_CODES.map((code) => {
        const selected = value === code;
        return (
          <button
            key={code}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(code)}
            className={cn(
              "min-h-10 flex-1 rounded-lg text-sm font-semibold transition-colors",
              selected
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {code}조
          </button>
        );
      })}
    </div>
  );
}

function TodaySleepHero({
  todaySleep,
  workLine,
}: {
  todaySleep: RecommendedSleep;
  workLine: string | null;
}) {
  return (
    <section className="app-sleep-panel relative shrink-0 overflow-hidden px-4 py-4">
      <div className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full bg-sleep-foreground/[0.07] blur-2xl" />

      <div className="relative space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-medium text-sleep-foreground/70">오늘의 수면</p>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm leading-snug">
              <span className="font-bold tracking-tight">{todaySleep.label}</span>
              {workLine && (
                <>
                  <span className="text-muted-foreground/40" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-xs text-muted-foreground">근무 {workLine}</span>
                </>
              )}
            </p>
          </div>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-sleep-foreground/10">
            <Moon className="size-5 text-sleep-foreground" aria-hidden="true" />
          </span>
        </div>

        <div className="space-y-1">
          <SleepTimeDisplay bedTime={todaySleep.bedTime} wakeTime={todaySleep.wakeTime} size="lg" />
          <p className="text-sm font-medium text-muted-foreground">
            {getSleepDurationLabel(todaySleep.bedTime, todaySleep.wakeTime)}
          </p>
        </div>
      </div>
    </section>
  );
}

function SelectedShiftPanel({
  schedule,
  isToday,
}: {
  schedule: RecommendedSleep;
  isToday: boolean;
}) {
  const work = isMainShiftKey(schedule.key) ? WORK_BY_CODE[schedule.key] : null;

  return (
    <div className="space-y-3 rounded-xl bg-muted/30 px-4 py-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground">추천 수면</p>
          <p className="mt-0.5 text-sm font-semibold">{schedule.label}</p>
        </div>
        {isToday && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            오늘 해당
          </span>
        )}
      </div>

      <SleepTimeDisplay bedTime={schedule.bedTime} wakeTime={schedule.wakeTime} size="md" />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>{getSleepDurationLabel(schedule.bedTime, schedule.wakeTime)}</span>
        {work && <span>근무 {work.hours}</span>}
      </div>
    </div>
  );
}

function TransitionSleepList({ schedules }: { schedules: RecommendedSleep[] }) {
  return (
    <section className="shrink-0 space-y-2">
      <h3 className="px-0.5 text-xs font-semibold text-muted-foreground">교대 전환</h3>
      <ul className="divide-y divide-border/40 rounded-xl bg-muted/25">
        {schedules.map((schedule) => {
          const label =
            TRANSITION_LABELS[schedule.key as (typeof TRANSITION_KEYS)[number]] ?? schedule.label;

          return (
            <li
              key={schedule.key}
              className="flex items-center justify-between gap-3 px-3 py-2.5 first:rounded-t-xl last:rounded-b-xl"
            >
              <span className="min-w-0 truncate text-xs font-medium text-foreground">{label}</span>
              <span className="shrink-0 text-xs font-semibold tabular-nums text-sleep-foreground">
                {formatHeroSleepRange(schedule.bedTime, schedule.wakeTime)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function SleepScheduleTable() {
  const today = useSeoulToday();
  const { settings, isLoading } = useShiftSettings();
  const shiftSettings = settings ?? DEFAULT_SHIFT_SETTINGS;
  const schedules = getAllSleepSchedules();
  const todaySleep = settings ? getRecommendedSleepNow(new Date(), settings) : null;

  const defaultShift = useMemo((): MainShiftCode => {
    if (todaySleep && isMainShiftKey(todaySleep.key)) {
      return todaySleep.key;
    }
    return "B";
  }, [todaySleep]);

  const [selectedShift, setSelectedShift] = useState<MainShiftCode | null>(null);
  const activeShift = selectedShift ?? defaultShift;

  const scheduleMap = useMemo(
    () => new Map(schedules.map((schedule) => [schedule.key, schedule])),
    [schedules],
  );

  const mainSchedules = useMemo(
    () =>
      MAIN_SHIFT_CODES.map((code) => scheduleMap.get(code)).filter(
        (schedule): schedule is RecommendedSleep => Boolean(schedule),
      ),
    [scheduleMap],
  );

  const transitionSchedules = useMemo(
    () =>
      TRANSITION_KEYS.map((key) => scheduleMap.get(key)).filter(
        (schedule): schedule is RecommendedSleep => Boolean(schedule),
      ),
    [scheduleMap],
  );

  const selectedSchedule = scheduleMap.get(activeShift) ?? mainSchedules[0];
  const todayShift = getShiftForDate(today, shiftSettings);

  const workLine =
    todayShift.code !== "OFF" && todayShift.startTime && todayShift.endTime
      ? formatCompactTimeRange(todayShift.startTime, todayShift.endTime)
      : null;

  return (
    <div
      className={cn(
        PAGE_VIEWPORT_HEIGHT,
        "flex min-h-0 flex-col gap-3 overflow-y-auto overscroll-contain py-1",
      )}
    >
      {isLoading ? (
        <Skeleton className="h-44 w-full shrink-0 rounded-2xl" />
      ) : todaySleep ? (
        <TodaySleepHero todaySleep={todaySleep} workLine={workLine} />
      ) : null}

      <section className="min-h-0 shrink-0 space-y-2.5">
        <h2 className="px-0.5 text-xs font-semibold text-muted-foreground">교대별 수면</h2>
        <ShiftSegmentedControl value={activeShift} onChange={setSelectedShift} />
        {selectedSchedule && (
          <SelectedShiftPanel
            schedule={selectedSchedule}
            isToday={todaySleep?.key === selectedSchedule.key}
          />
        )}
      </section>

      <TransitionSleepList schedules={transitionSchedules} />
    </div>
  );
}
