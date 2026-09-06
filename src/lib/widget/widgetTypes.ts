/** Payload shared between web app and a future iOS WidgetKit extension. */
export interface WidgetSnapshot {
  version: 1;
  generatedAt: string;
  today: string;
  shift: {
    code: string;
    name: string;
    cycleLabel: string;
    workRange: string | null;
    isOff: boolean;
  };
  sleep: {
    label: string;
    rangeCompact: string;
    rangeFull: string;
    durationHours: number;
  };
  nextOff: {
    date: string;
    daysUntil: number;
  } | null;
  nextWork: {
    date: string;
    code: string;
    name: string;
    workRange: string | null;
  } | null;
  deepLinks: {
    home: string;
    sleep: string;
    calendar: string;
  };
}

export type WidgetFamily = "small" | "medium" | "large";

export interface WidgetLayoutSpec {
  family: WidgetFamily;
  title: string;
  description: string;
  fields: string[];
}

export const WIDGET_LAYOUT_SPECS: WidgetLayoutSpec[] = [
  {
    family: "small",
    title: "소형 (2×2)",
    description: "한눈에 오늘 근무/휴무와 근무 시간",
    fields: ["shift.code", "shift.workRange | 휴무", "shift.cycleLabel"],
  },
  {
    family: "medium",
    title: "중형 (4×2)",
    description: "오늘 근무 + 꿀잠 추천 수면",
    fields: [
      "shift.cycleLabel + workRange",
      "sleep.rangeCompact + durationHours",
      "nextOff.daysUntil (D-N)",
    ],
  },
  {
    family: "large",
    title: "대형 (4×4)",
    description: "홈 탭 요약 — 근무, 수면, 다음 휴무/근무",
    fields: [
      "shift full row",
      "sleep full row",
      "nextOff + nextWork cards",
      "tap → app home",
    ],
  },
];
