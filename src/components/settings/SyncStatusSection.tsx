"use client";

import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/useClientOnly";
import { useSyncActions } from "@/hooks/useSyncActions";
import { useSyncStatus } from "@/stores/syncStore";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useAuth } from "@/stores/authStore";

export function SyncStatusSection() {
  const hydrated = useHydrated();
  const { isAuthenticated } = useAuth();
  const { status, label, lastSyncedAt, pendingCount, lastError, isSyncing } = useSyncStatus();
  const { triggerSync } = useSyncActions();

  if (!isSupabaseConfigured()) {
    return (
      <section className="app-card p-6">
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">데이터 동기화</h2>
        <p className="text-sm text-muted-foreground">Supabase 설정 후 클라우드 동기화를 사용할 수 있습니다.</p>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="app-card p-6">
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">데이터 동기화</h2>
        <p className="text-sm text-muted-foreground">로그인하면 IndexedDB 데이터가 Supabase와 동기화됩니다.</p>
      </section>
    );
  }

  return (
    <section className="app-card p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">데이터 동기화</h2>
        <span
          className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium"
          aria-live="polite"
        >
          {label}
        </span>
      </div>

      <dl className="space-y-2 text-sm">
        {lastSyncedAt && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">마지막 동기화</dt>
            <dd suppressHydrationWarning>
              {hydrated ? new Date(lastSyncedAt).toLocaleString("ko-KR") : lastSyncedAt}
            </dd>
          </div>
        )}
        {pendingCount > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">대기 중</dt>
            <dd>{pendingCount}건</dd>
          </div>
        )}
        {lastError && (
          <div>
            <dt className="text-muted-foreground">오류</dt>
            <dd className="mt-1 text-destructive">{lastError}</dd>
          </div>
        )}
      </dl>

      <Button
        variant="outline"
        className="mt-4 w-full"
        onClick={() => void triggerSync()}
        disabled={isSyncing || status === "offline"}
        aria-label="지금 동기화"
      >
        {isSyncing ? "동기화 중..." : "지금 동기화"}
      </Button>
    </section>
  );
}
