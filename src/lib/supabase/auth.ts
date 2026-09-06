import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { createClient } from "./client";

type AppSupabaseClient = SupabaseClient<Database>;

export type AuthResult = {
  success: boolean;
  message: string;
};

function getClient(): AppSupabaseClient | null {
  return createClient();
}

export async function signInWithMagicLink(email: string): Promise<AuthResult> {
  const supabase = getClient();
  if (!supabase) {
    return {
      success: false,
      message: "Supabase가 설정되지 않았습니다. .env.local을 확인해 주세요.",
    };
  }

  const redirectTo = `${window.location.origin}/auth/callback`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return {
    success: true,
    message: "로그인 링크를 이메일로 보냈습니다. 메일함을 확인해 주세요.",
  };
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<AuthResult> {
  const supabase = getClient();
  if (!supabase) {
    return {
      success: false,
      message: "Supabase가 설정되지 않았습니다. .env.local을 확인해 주세요.",
    };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "로그인되었습니다." };
}

export async function signUpWithPassword(
  email: string,
  password: string,
): Promise<AuthResult> {
  const supabase = getClient();
  if (!supabase) {
    return {
      success: false,
      message: "Supabase가 설정되지 않았습니다. .env.local을 확인해 주세요.",
    };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return {
    success: true,
    message: "회원가입이 완료되었습니다. 이메일 인증 후 로그인해 주세요.",
  };
}

export async function signOut(): Promise<AuthResult> {
  const supabase = getClient();
  if (!supabase) {
    return { success: true, message: "로그아웃되었습니다." };
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "로그아웃되었습니다." };
}

export async function deleteAccount(): Promise<AuthResult> {
  return {
    success: false,
    message: "계정 삭제 기능은 Phase 15에서 Supabase Edge Function과 함께 제공됩니다.",
  };
}
