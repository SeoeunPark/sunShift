"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getLocalPushSubscription,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push/subscription";
import { getVapidPublicKey } from "@/lib/push/config";
import { isPushSupported } from "@/lib/pwa/registerServiceWorker";
import { useAuth } from "@/stores/authStore";

export function usePushSubscription() {
  const { user, isAuthenticated } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const isSupported = isPushSupported();
  const isConfigured = Boolean(getVapidPublicKey());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
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
  }, [isSupported, reloadToken, user?.id]);

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  const subscribe = useCallback(async () => {
    if (!user) {
      throw new Error("로그인 후 Push 알림을 사용할 수 있습니다.");
    }

    setIsWorking(true);
    setError(null);

    try {
      await subscribeToPush(user.id);
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
  }, [reload, user]);

  const unsubscribe = useCallback(async () => {
    if (!user) {
      return;
    }

    setIsWorking(true);
    setError(null);

    try {
      await unsubscribeFromPush(user.id);
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
  }, [reload, user]);

  return {
    isSupported,
    isConfigured,
    isAuthenticated,
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
