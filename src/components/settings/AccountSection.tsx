"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingCard } from "@/components/ui/LoadingCard";
import { useShiftSettings } from "@/hooks/useShiftSettings";
import { signOut } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { DEFAULT_SHIFT_SETTINGS } from "@/lib/shift/shiftPattern";
import { useAuth } from "@/stores/authStore";

export function AccountSection() {
  const router = useRouter();
  const { user, profile, isLoading, isAuthenticated } = useAuth();
  const { settings, isLoading: isSettingsLoading } = useShiftSettings();
  const [message, setMessage] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const shiftSettings = settings ?? DEFAULT_SHIFT_SETTINGS;

  async function handleSignOut() {
    setIsSigningOut(true);
    const result = await signOut();
    setMessage(result.message);
    setIsSigningOut(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="app-card p-6">
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">교대 설정</h2>
        {isSettingsLoading ? (
          <LoadingCard lines={3} className="border-0 p-0 shadow-none" />
        ) : (
          <>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">내 조</dt>
                <dd>{shiftSettings.groupNumber}조</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">근무 패턴</dt>
                <dd>6근 2휴</dd>
              </div>
            </dl>
            <Link
              href="/onboarding?edit=1"
              className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted"
            >
              교대 설정 변경
            </Link>
          </>
        )}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>계정</CardTitle>
          <CardDescription>
            {isSupabaseConfigured()
              ? "로그인하면 클라우드 동기화가 활성화됩니다."
              : "Supabase 환경변수가 설정되지 않았습니다."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">계정 정보 확인 중...</p>
          ) : isAuthenticated && user ? (
            <>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{profile?.display_name ?? "사용자"}</p>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                데이터는 IndexedDB에 저장되며 Supabase와 동기화됩니다.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? "로그아웃 중..." : "로그아웃"}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                로그인하지 않아도 로컬 IndexedDB에서 교대 계산을 사용할 수 있습니다.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
              >
                로그인 / 회원가입
              </Link>
            </>
          )}

          {message && (
            <p className="text-sm text-muted-foreground" role="status">
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
