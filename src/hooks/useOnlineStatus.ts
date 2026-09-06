"use client";

import { useSyncExternalStore } from "react";
import { isBrowserOnline, subscribeOnlineStatus } from "@/lib/sync/onlineStatus";

function subscribe(onStoreChange: () => void) {
  return subscribeOnlineStatus(onStoreChange, onStoreChange);
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, () => isBrowserOnline(), () => true);
}
