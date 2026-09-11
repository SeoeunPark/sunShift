"use client";

import Link from "next/link";
import { Calendar, Moon, Palmtree, TreePalm } from "lucide-react";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import { ShiftBadge } from "@/components/shift/ShiftBadge";
import { AppCard } from "@/components/ui/AppCard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKoreanDate, formatKoreanDateWithWeekday } from "@/lib/date/dateUtils";
import {
  formatCompactSleepRange,
  formatCompactTimeRange,
  getRecommendedSleepNow,
} from "@/lib/sleep/sleepSchedule";
import { getCyclePosition } from "@/lib/shift";
import { formatShiftDayLabelWithTotal } from "@/lib/shift/shiftLabels";
import { getPatternById } from "@/lib/shift/shiftPattern";
import { useLeaveBalances } from "@/hooks/useLeaveBalance";
import { useNextOff, useNextWorkDay, useTodayShift } from "@/hooks/useTodayShift";
import { PAGE_VIEWPORT_HEIGHT } from "@/lib/layout/viewport";
import { cn } from "@/lib/utils";

function HomeStatCard({
  label,
  icon: Icon,
  children,
  href,
  accent,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  href?: string;
  accent?: "primary" | "sleep" | "default";
}) {
  const iconWrapClass = cn(
    "mb-1.5 flex size-6 items-center justify-center rounded-lg",
    accent === "primary" && "bg-primary/10 text-primary",
    accent === "sleep" && "bg-sleep text-sleep-foreground",
    (!accent || accent === "default") && "bg-muted text-muted-foreground",
  );

  const content = (
    <div className={cn("stat-tile", href && "stat-tile-interactive")}>
      <div className={iconWrapClass}>
        <Icon className="size-3.5" aria-hidden="true" />
      </div>
      <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
      <div className="mt-0.5 w-full">{children}</div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block min-w-0">
        {content}
      </Link>
    );
  }

  return content;
}

export function HomeDashboard() {
  const { today, todayShift, settings, isLoading: isTodayLoading } = useTodayShift();
  const { nextOffDate, daysUntilOff, isLoading: isOffLoading } = useNextOff();
  const { nextWorkDay, isLoading: isWorkLoading } = useNextWorkDay();
  const { annual, nightCare, isLoading: isLeaveLoading } = useLeaveBalances();

  const isLoading = isTodayLoading || isOffLoading || isWorkLoading || isLeaveLoading;

  const cycleLabel = !isTodayLoading
    ? formatShiftDayLabelWithTotal(
        getCyclePosition(today, settings),
        getPatternById(settings.patternId),
      )
    : null;

  const recommendedSleep = !isTodayLoading
    ? getRecommendedSleepNow(new Date(), settings)
    : null;

  const isOffToday = todayShift.code === "OFF";

  return (
    <div className={cn(PAGE_VIEWPORT_HEIGHT, "flex min-h-0 flex-col gap-1.5 overflow-hidden py-1")}>
      <AppCard variant="hero" as="section" className="relative shrink-0 p-3.5">
        {isLoading ? (
          <div className="relative space-y-2" aria-busy="true" aria-label="근무 정보 불러오는 중">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-3.5 w-48" />
          </div>
        ) : (
          <div className="relative">
            <p className="text-xs font-medium text-muted-foreground">
              {formatKoreanDateWithWeekday(today)}
            </p>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <p className="text-2xl font-bold tracking-tight">{cycleLabel}</p>
              <ShiftBadge code={todayShift.code} size="lg" />
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-sm">
              <span className="app-card-inset inline-flex items-center gap-1.5 px-2.5 py-1 tabular-nums">
                <span className="text-muted-foreground">근무</span>
                {todayShift.startTime && todayShift.endTime ? (
                  <span className="font-semibold text-foreground">
                    {formatCompactTimeRange(todayShift.startTime, todayShift.endTime)}
                  </span>
                ) : (
                  <span className="font-semibold text-foreground">휴무</span>
                )}
              </span>
              {recommendedSleep && (
                <span className="app-sleep-panel inline-flex items-center gap-1.5 px-2.5 py-1 tabular-nums">
                  <Moon className="size-3.5 shrink-0 text-sleep-foreground" aria-hidden="true" />
                  <span className="text-muted-foreground">취침</span>
                  <span className="font-semibold text-sleep-foreground">
                    {formatCompactSleepRange(recommendedSleep.bedTime, recommendedSleep.wakeTime)}
                  </span>
                </span>
              )}
            </div>

            <div className="mt-2.5 grid grid-cols-3 gap-1.5">
              <HomeStatCard label="다음 휴무" icon={Palmtree} accent="primary">
                {isOffToday ? (
                  <>
                    <p className="text-base font-bold text-primary">오늘</p>
                    <p className="text-[10px] text-muted-foreground">휴무 중</p>
                  </>
                ) : (
                  <>
                    <p className="text-base font-bold tabular-nums text-primary">D-{daysUntilOff}</p>
                    <p className="text-[10px] text-muted-foreground">{formatKoreanDate(nextOffDate)}</p>
                  </>
                )}
              </HomeStatCard>

              <HomeStatCard label="다음 근무" icon={Calendar}>
                {nextWorkDay ? (
                  <>
                    <p className="text-sm font-bold leading-tight">{formatKoreanDate(nextWorkDay.date)}</p>
                    <p className="text-[10px] font-medium text-muted-foreground">{nextWorkDay.name}</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">-</p>
                )}
              </HomeStatCard>

              <HomeStatCard label="휴가" icon={TreePalm} href="/leave" accent="primary">
                <p className="text-sm font-bold leading-tight tabular-nums text-primary">
                  연중 {annual.remaining}/{annual.total}
                </p>
                <p className="text-[10px] tabular-nums text-muted-foreground">
                  야간케어 {nightCare.remaining}/{nightCare.total}
                </p>
              </HomeStatCard>
            </div>
          </div>
        )}
      </AppCard>

      <AppCard as="section" className="flex min-h-0 flex-1 flex-col p-2.5">
        <div className="mb-1.5 flex shrink-0 items-center justify-between gap-2 px-0.5">
          <h2 className="text-xs font-semibold text-foreground">이번 달 근무표</h2>
          <Link
            href="/calendar"
            className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/15"
          >
            <Calendar className="size-3" aria-hidden="true" />
            전체
          </Link>
        </div>
        <div className="min-h-0 flex-1">
          <MonthCalendar embedded compact />
        </div>
      </AppCard>
    </div>
  );
}
