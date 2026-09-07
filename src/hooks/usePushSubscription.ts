"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { enableCloudPushNotifications } from "@/lib/notifications/ensureCloudNotifications";
import {
  getLocalPushSubscription,
  unsubscribeFromPush,
} from "@/lib/push/subscription";
import { fetchPushConfig } from "@/lib/push/clientConfig";
import {
  getPushSubscriptionSnapshot,
  setPushSubscriptionSnapshot,
  type PushSubscriptionSnapshot,
} from "@/lib/push/pushSubscriptionCache";
import { isPushSupported } from "@/lib/pwa/registerServiceWorker";
import { resolveUserId } from "@/lib/repositories/getUserId";
import { useAuth } from "@/stores/authStore";

function applySnapshot(snapshot: PushSubscriptionSnapshot) {
  setPushSubscriptionSnapshot(snapshot);
  return snapshot;
}

export function usePushSubscription() {
  const { user } = useAuth();
  const userId = resolveUserId(user?.id);
  const cached = getPushSubscriptionSnapshot();
  const silentReloadRef = useRef(false);

  const [isConfigured, setIsConfigured] = useState<boolean | null>(cached?.isConfigured ?? null);
  const [permission, setPermission] = useState<NotificationPermission>(cached?.permission ?? "default");
  const [isSubscribed, setIsSubscribed] = useState(cached?.isSubscribed ?? false);
  const [isLoading, setIsLoading] = useState(cached === null);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const isSupported = isPushSupported();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const silent = silentReloadRef.current;
      silentReloadRef.current = false;

      if (!silent && getPushSubscriptionSnapshot() === null) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const pushConfig = await fetchPushConfig();
        const configured = pushConfig.configured;

        if (!isSupported) {
          if (!cancelled) {
            const snapshot = applySnapshot({
              isConfigured: configured,
              permission: "denied",
              isSubscribed: false,
            });
            setIsConfigured(snapshot.isConfigured);
            setPermission(snapshot.permission);
            setIsSubscribed(snapshot.isSubscribed);
          }
          return;
        }

        const nextPermission = Notification.permission;
        let subscription: PushSubscription | null = null;

        try {
          subscription = await getLocalPushSubscription();
        } catch {
          subscription = null;
        }

        if (!cancelled) {
          const snapshot = applySnapshot({
            isConfigured: configured,
            permission: nextPermission,
            isSubscribed: Boolean(subscription),
          });
          setIsConfigured(snapshot.isConfigured);
          setPermission(snapshot.permission);
          setIsSubscribed(snapshot.isSubscribed);
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
  }, [isSupported, reloadToken, userId]);

  const reload = useCallback((options?: { silent?: boolean }) => {
    silentReloadRef.current = options?.silent ?? false;
    setReloadToken((value) => value + 1);
  }, []);

  const subscribe = useCallback(async () => {
    setIsWorking(true);
    setError(null);

    try {
      await enableCloudPushNotifications(userId);
      const snapshot = applySnapshot({
        isConfigured: true,
        permission: "granted",
        isSubscribed: true,
      });
      setIsConfigured(snapshot.isConfigured);
      setPermission(snapshot.permission);
      setIsSubscribed(snapshot.isSubscribed);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Push 구독에 실패했습니다.";
      setError(message);
      throw err;
    } finally {
      setIsWorking(false);
    }
  }, [userId]);

  const unsubscribe = useCallback(async () => {
    setIsWorking(true);
    setError(null);

    try {
      await unsubscribeFromPush(userId);
      const nextPermission = Notification.permission;
      const snapshot = applySnapshot({
        isConfigured: isConfigured ?? true,
        permission: nextPermission,
        isSubscribed: false,
      });
      setPermission(snapshot.permission);
      setIsSubscribed(snapshot.isSubscribed);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Push 구독 해제에 실패했습니다.";
      setError(message);
      throw err;
    } finally {
      setIsWorking(false);
    }
  }, [isConfigured, userId]);

  return {
    isSupported,
    isConfigured,
    permission,
    isSubscribed,
    isLoading,
    isWorking,
    error,
    subscribe,
    unsubscribe,
    reload,
  };
}
