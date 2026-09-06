"use client";

import { useMemo } from "react";
import { groupMemos } from "@/lib/date/memoUtils";
import { getTodaySeoul } from "@/lib/date/today";
import { useMemos } from "./useMemos";

export function useMemoGroups() {
  const { records, isLoading, error, create, update, remove, getByDate, reload } = useMemos();
  const today = getTodaySeoul();

  const groups = useMemo(() => groupMemos(records, today), [records, today]);

  return {
    ...groups,
    today,
    records,
    isLoading,
    error,
    create,
    update,
    remove,
    getByDate,
    reload,
  };
}
