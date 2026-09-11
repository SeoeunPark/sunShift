"use client";

import { useEffect, useRef } from "react";
import { getPushSubscriptionPayload } from "@/lib/push/subscription";
import { isPushSupported } from "@/lib/pwa/registerServiceWorker";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const CATCH_UP_STORAGE_KEY = "shift:last-push-catch-up";
const CATCH_UP_INTERVAL_MS = 5 * 60 * 1000;

async function runPushCatchUp(): Promise<boolean> {
  if (!isSupabaseConfigured() || !isPushSupported()) {
    return false;
  }

  const lastRun = Number(sessionStorage.getItem(CATCH_UP_STORAGE_KEY) ?? "0");
  if (Date.now() - lastRun < CATCH_UP_INTERVAL_MS) {
    return false;
  }

  const payload = await getPushSubscriptionPayload();
  if (!payload) {
    return false;
  }

  const response = await fetch("/api/push/catch-up", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    sessionStorage.setItem(CATCH_UP_STORAGE_KEY, String(Date.now()));
    return true;
  }

  return false;
}

export function PushCatchUpProvider({ children }: { children: React.ReactNode }) {
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    void runPushCatchUp().catch(() => undefined);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void runPushCatchUp().catch(() => undefined);
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return children;
}
