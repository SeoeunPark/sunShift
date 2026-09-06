"use client";

import { useState, useSyncExternalStore } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { SEOUL_TIMEZONE } from "@/lib/date/dateUtils";

function readSeoulToday(): string {
  return formatInTimeZone(new Date(), SEOUL_TIMEZONE, "yyyy-MM-dd");
}

/** True only after the client has hydrated (false during SSR + hydration). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/** Seoul date frozen at first render — stable across SSR and hydration. */
export function useSeoulToday(): string {
  const [today] = useState(() => readSeoulToday());
  return today;
}
