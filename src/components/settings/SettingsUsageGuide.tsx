"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const NOTIFICATION_FLOW = [
  "아래 「홈 화면에 추가」에서 설치",
  "홈 화면 SHIFT 아이콘으로 열기",
  "로그인",
  "Push 알림 켜기 + 알림 허용",
  "근무 · 수면 알림에서 종류 선택",
] as const;

const APP_TIPS = [
  { label: "홈", text: "오늘 근무, 다음 휴무, 이번 달 달력" },
  { label: "달력", text: "월별 근무표 · 연차 · 메모" },
  { label: "꿀잠", text: "교대별 추천 수면 시간" },
  { label: "연차", text: "연차 등록 · 잔여 일수" },
] as const;

export function SettingsUsageGuide() {
  const [open, setOpen] = useState(false);

  return (
    <section className="app-card overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/30"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">사용법</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            알림 설정 순서 · 탭 안내
          </p>
        </div>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="space-y-4 border-t border-border/50 px-4 py-3.5">
          <div>
            <p className="text-xs font-semibold text-foreground">알림 받기</p>
            <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-xs leading-relaxed text-muted-foreground">
              {NOTIFICATION_FLOW.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>

          <div>
            <p className="text-xs font-semibold text-foreground">탭별 기능</p>
            <ul className="mt-1.5 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
              {APP_TIPS.map((tip) => (
                <li key={tip.label}>
                  <span className="font-medium text-foreground">{tip.label}</span>
                  {" · "}
                  {tip.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
