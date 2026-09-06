"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { LoadingCard } from "@/components/ui/LoadingCard";
import { createClient } from "@/lib/supabase/client";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      router.replace("/auth/login?error=auth");
      return;
    }

    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;
    const nextParam = searchParams.get("next") ?? "/settings";
    const next = nextParam.startsWith("/") ? nextParam : "/settings";

    const authClient = supabase;

    async function finish() {
      if (code) {
        const { error } = await authClient.auth.exchangeCodeForSession(code);
        if (error) {
          const hint =
            error.message.includes("PKCE") || error.message.includes("code verifier")
              ? "same_browser"
              : "generic";
          router.replace(
            `/auth/login?error=auth&hint=${hint}&message=${encodeURIComponent(error.message)}`,
          );
          return;
        }
      } else if (tokenHash && type) {
        const { error } = await authClient.auth.verifyOtp({
          token_hash: tokenHash,
          type,
        });
        if (error) {
          router.replace(
            `/auth/login?error=auth&message=${encodeURIComponent(error.message)}`,
          );
          return;
        }
      } else {
        router.replace("/auth/login?error=auth");
        return;
      }

      router.replace(next);
      router.refresh();
    }

    void finish();
  }, [router, searchParams]);

  return (
    <div className="py-8">
      <LoadingCard lines={2} />
      <p className="mt-4 text-center text-xs text-muted-foreground">로그인 확인 중...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="py-8">
          <LoadingCard lines={2} />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
