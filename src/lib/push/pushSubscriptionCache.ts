export interface PushSubscriptionSnapshot {
  isConfigured: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
}

let cachedSnapshot: PushSubscriptionSnapshot | null = null;

export function getPushSubscriptionSnapshot(): PushSubscriptionSnapshot | null {
  return cachedSnapshot;
}

export function setPushSubscriptionSnapshot(snapshot: PushSubscriptionSnapshot): void {
  cachedSnapshot = snapshot;
}

export function clearPushSubscriptionSnapshot(): void {
  cachedSnapshot = null;
}
