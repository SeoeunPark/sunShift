"use client";

import { useCallback, useEffect, useState } from "react";
import { getLeaveTotal, setLeaveTotal as saveLeaveTotal } from "@/lib/db/leaveSettings";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useAuth } from "@/stores/authStore";
import { useActiveUserId } from "./useActiveUserId";
import { useLeave } from "./useLeave";

export function useLeaveBalance() {
  const userId = useActiveUserId();
  const { profile } = useAuth();
  const { records, isLoading: isLeaveLoading } = useLeave();
  const [total, setTotal] = useState(15);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        if (profile?.leave_total != null) {
          if (!cancelled) {
            setTotal(profile.leave_total);
          }
          return;
        }
        const localTotal = await getLeaveTotal(userId);
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
  }, [profile?.leave_total, userId]);

  const used = records.length;
  const remaining = Math.max(0, total - used);

  const updateTotal = useCallback(
    async (nextTotal: number) => {
      const normalized = Math.max(0, nextTotal);
      await saveLeaveTotal(userId, normalized);
      setTotal(normalized);

      if (isSupabaseConfigured() && profile) {
        const supabase = createClient();
        if (supabase) {
          await supabase.from("profiles").update({ leave_total: normalized }).eq("id", userId);
        }
      }
    },
    [profile, userId],
  );

  return {
    total,
    used,
    remaining,
    updateTotal,
    isLoading: isLoading || isLeaveLoading,
  };
}
