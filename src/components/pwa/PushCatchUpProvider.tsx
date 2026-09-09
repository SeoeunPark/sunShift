"use client";

import { useEffect, useRef } from "react";
import { getLocalPushSubscription } from "@/lib/push/subscription";
import { isPushSupported } from "@/lib/pwa/registerServiceWorker";
import { ensureCloudSession } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const CATCH_UP_STORAGE_KEY = "shift:last-push-catch-up";
const CATCH_UP_INTERVAL_MS = 30 * 60 * 1000;

async function shouldRunCatchUp(): Promise<boolean> {
  if (!isPushSupported()) {
    return false;
  }

  const subscription = await getLocalPushSubscription();
  if (!subscription) {
    return false;
  }

  const lastRun = Number(sessionStorage.getItem(CATCH_UP_STORAGE_KEY) ?? "0");
  return Date.now() - lastRun >= CATCH_UP_INTERVAL_MS;
}

export function PushCatchUpProvider({ children }: { children: React.ReactNode }) {
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    void (async () => {
      try {
        if (!isSupabaseConfigured() || !(await shouldRunCatchUp())) {
          return;
        }

        await ensureCloudSession();

        const response = await fetch("/api/push/catch-up", { method: "POST" });
        if (response.ok) {
          sessionStorage.setItem(CATCH_UP_STORAGE_KEY, String(Date.now()));
        }
      } catch {
        // Best-effort catch-up; ignore network errors.
      }
    })();
  }, []);

  return children;
}
