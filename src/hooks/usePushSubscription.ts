"use client";

import { useCallback, useEffect, useState } from "react";
import { enableCloudPushNotifications } from "@/lib/notifications/ensureCloudNotifications";
import {
  getLocalPushSubscription,
  unsubscribeFromPush,
} from "@/lib/push/subscription";
import { fetchPushConfig } from "@/lib/push/clientConfig";
import { isPushSupported } from "@/lib/pwa/registerServiceWorker";
import { resolveUserId } from "@/lib/repositories/getUserId";
import { useAuth } from "@/stores/authStore";

export function usePushSubscription() {
  const { user } = useAuth();
  const userId = resolveUserId(user?.id);
  const [isConfigured, setIsConfigured] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const isSupported = isPushSupported();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const pushConfig = await fetchPushConfig();
        if (!cancelled) {
          setIsConfigured(pushConfig.configured);
        }

        if (!isSupported) {
          if (!cancelled) {
            setIsSubscribed(false);
            setPermission("denied");
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
          setPermission(nextPermission);
          setIsSubscribed(Boolean(subscription) || nextPermission === "granted");
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

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  const subscribe = useCallback(async () => {
    setIsWorking(true);
    setError(null);

    try {
      await enableCloudPushNotifications(userId);
      setPermission("granted");
      setIsSubscribed(true);
      reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Push 구독에 실패했습니다.";
      setError(message);
      throw err;
    } finally {
      setIsWorking(false);
    }
  }, [reload, userId]);

  const unsubscribe = useCallback(async () => {
    setIsWorking(true);
    setError(null);

    try {
      await unsubscribeFromPush(userId);
      setPermission(Notification.permission);
      setIsSubscribed(false);
      reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Push 구독 해제에 실패했습니다.";
      setError(message);
      throw err;
    } finally {
      setIsWorking(false);
    }
  }, [reload, userId]);

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
