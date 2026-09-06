"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PwaNotificationGuide } from "@/components/pwa/PwaNotificationGuide";
import { usePushSubscription } from "@/hooks/usePushSubscription";
import { getIosPushRequirementNote, isIosDevice } from "@/lib/pwa/notificationSetupGuide";
import { isPwaInstalled } from "@/lib/pwa/registerServiceWorker";

export function PushNotificationSection() {
  const {
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
  } = usePushSubscription();
  const [message, setMessage] = useState<string | null>(null);

  const needsPwaInstall = isIosDevice() && !isPwaInstalled();

  async function handleSubscribe() {
    setMessage(null);
    try {
      await subscribe();
      setMessage("Push 알림이 활성화되었습니다. 아래에서 받을 알림 종류를 선택하세요.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Push 구독에 실패했습니다.");
    }
  }

  async function handleUnsubscribe() {
    setMessage(null);
    try {
      await unsubscribe();
      setMessage("Push 알림이 해제되었습니다.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Push 구독 해제에 실패했습니다.");
    }
  }

  async function handleTestNotification() {
    setMessage(null);
    try {
      const response = await fetch("/api/push/test", { method: "POST" });
      const payload = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "테스트 알림 전송에 실패했습니다.");
      }
      setMessage(payload.message ?? "테스트 알림을 보냈습니다.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "테스트 알림 전송에 실패했습니다.");
    }
  }

  if (!isConfigured) {
    return null;
  }

  return (
    <section className="app-card p-6">
      <h2 className="mb-4 text-sm font-medium text-muted-foreground">Push 알림</h2>

      {needsPwaInstall && (
        <div className="mb-4 space-y-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {getIosPushRequirementNote()}
          </p>
          <p className="text-xs font-medium text-foreground">
            먼저 위 &quot;홈 화면에 추가&quot;를 완료한 뒤, 홈 화면 아이콘으로 다시 열어 주세요.
          </p>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Push 상태 확인 중...</p>
      ) : !isSupported ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            이 브라우저는 Web Push를 지원하지 않습니다.
          </p>
          {isIosDevice() && <PwaNotificationGuide compact />}
        </div>
      ) : !isAuthenticated ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Push 구독은 로그인한 계정에 연결됩니다.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            로그인하기
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">권한</dt>
              <dd>{permission}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">구독 상태</dt>
              <dd>{isSubscribed ? "활성" : "비활성"}</dd>
            </div>
          </dl>

          {!isSubscribed ? (
            <Button
              className="w-full"
              onClick={() => void handleSubscribe()}
              disabled={isWorking || needsPwaInstall}
            >
              {isWorking ? "구독 중..." : "Push 알림 켜기"}
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => void handleTestNotification()}
                disabled={isWorking}
              >
                테스트 알림 보내기
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => void handleUnsubscribe()}
                disabled={isWorking}
              >
                Push 알림 끄기
              </Button>
            </div>
          )}
        </div>
      )}

      {(message || error) && (
        <p className="mt-4 text-sm text-muted-foreground" role="status">
          {message ?? error}
        </p>
      )}
    </section>
  );
}
