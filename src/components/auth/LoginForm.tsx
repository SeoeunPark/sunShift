"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  signInWithMagicLink,
  signInWithPassword,
  signUpWithPassword,
} from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type AuthMode = "magic" | "password";

function LoginFormContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "auth") {
      const detail = searchParams.get("message");
      setMessage(
        detail
          ? `로그인 확인에 실패했습니다. ${detail}`
          : "로그인 확인에 실패했습니다. 링크를 다시 요청해 주세요.",
      );
      setIsError(true);
    }
  }, [searchParams]);

  if (!isSupabaseConfigured()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Supabase 미설정</CardTitle>
          <CardDescription>
            `.env.local`에 Supabase URL과 Anon Key를 설정하면 로그인을 사용할 수
            있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/"
            className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted"
          >
            홈으로 돌아가기
          </Link>
        </CardContent>
      </Card>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setIsError(false);

    let result;

    if (mode === "magic") {
      result = await signInWithMagicLink(email);
    } else if (isSignUp) {
      result = await signUpWithPassword(email, password);
    } else {
      result = await signInWithPassword(email, password);
    }

    setMessage(result.message);
    setIsError(!result.success);
    setIsSubmitting(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isSignUp ? "회원가입" : "로그인"}</CardTitle>
        <CardDescription>
          로그인하면 클라우드 동기화가 활성화됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
          <Button
            type="button"
            variant={mode === "magic" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setMode("magic")}
          >
            Magic Link
          </Button>
          <Button
            type="button"
            variant={mode === "password" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setMode("password")}
          >
            이메일/비밀번호
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          {mode === "password" && (
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
              />
            </div>
          )}

          {message && (
            <p
              className={`text-sm ${isError ? "text-destructive" : "text-muted-foreground"}`}
              role="status"
            >
              {message}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? "처리 중..."
              : mode === "magic"
                ? "로그인 링크 보내기"
                : isSignUp
                  ? "회원가입"
                  : "로그인"}
          </Button>
        </form>

        {mode === "password" && (
          <button
            type="button"
            className="mt-4 w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => setIsSignUp((prev) => !prev)}
          >
            {isSignUp ? "이미 계정이 있나요? 로그인" : "계정이 없나요? 회원가입"}
          </button>
        )}
      </CardContent>
    </Card>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={null}>
      <LoginFormContent />
    </Suspense>
  );
}
