"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { initLocalDb } from "@/lib/db/initLocalDb";
import { useActiveUserId } from "@/hooks/useActiveUserId";

const DbReadyContext = createContext(false);

export function DbProvider({ children }: { children: React.ReactNode }) {
  const userId = useActiveUserId();
  const [readyUserId, setReadyUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void initLocalDb(userId).then(() => {
      if (!cancelled) {
        setReadyUserId(userId);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const isReady = readyUserId === userId;

  return <DbReadyContext.Provider value={isReady}>{children}</DbReadyContext.Provider>;
}

export function useDbReady(): boolean {
  return useContext(DbReadyContext);
}
