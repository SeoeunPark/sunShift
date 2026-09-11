"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getLeaveTotal, setLeaveTotal as saveLeaveTotal } from "@/lib/db/leaveSettings";
import type { LeaveType } from "@/lib/leave/leaveTypes";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useAuth } from "@/stores/authStore";
import { useActiveUserId } from "./useActiveUserId";
import { useLeave } from "./useLeave";

export interface LeaveBalance {
  total: number;
  used: number;
  remaining: number;
}

export function useLeaveBalance(type: LeaveType = "annual") {
  const userId = useActiveUserId();
  const { profile } = useAuth();
  const { records, isLoading: isLeaveLoading } = useLeave();
  const [total, setTotal] = useState(type === "annual" ? 15 : 0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        if (type === "annual" && profile?.leave_total != null) {
          if (!cancelled) {
            setTotal(profile.leave_total);
          }
          return;
        }

        if (type === "night_care" && profile?.night_care_leave_total != null) {
          if (!cancelled) {
            setTotal(profile.night_care_leave_total);
          }
          return;
        }

        const localTotal = await getLeaveTotal(userId, type);
        if (!cancelled) {
          setTotal(localTotal);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [profile?.leave_total, profile?.night_care_leave_total, type, userId]);

  const used = useMemo(
    () => records.filter((record) => record.type === type).length,
    [records, type],
  );
  const remaining = Math.max(0, total - used);

  const updateTotal = useCallback(
    async (nextTotal: number) => {
      const normalized = Math.max(0, nextTotal);
      await saveLeaveTotal(userId, type, normalized);
      setTotal(normalized);

      if (isSupabaseConfigured() && profile) {
        const supabase = createClient();
        if (supabase) {
          const column = type === "annual" ? "leave_total" : "night_care_leave_total";
          await supabase.from("profiles").update({ [column]: normalized }).eq("id", userId);
        }
      }
    },
    [profile, type, userId],
  );

  const balance: LeaveBalance = { total, used, remaining };

  return {
    ...balance,
    updateTotal,
    isLoading: isLoading || isLeaveLoading,
  };
}

export function useLeaveBalances() {
  const annual = useLeaveBalance("annual");
  const nightCare = useLeaveBalance("night_care");

  return {
    annual,
    nightCare,
    isLoading: annual.isLoading || nightCare.isLoading,
  };
}
