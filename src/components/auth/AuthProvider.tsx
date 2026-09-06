"use client";

import { useEffect } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useAuthStore } from "@/stores/authStore";
import type { Database } from "@/types/database";

type AppSupabaseClient = SupabaseClient<Database>;

async function fetchProfile(supabase: AppSupabaseClient, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  return data;
}

async function loadSession(
  supabase: AppSupabaseClient,
  setUser: (user: ReturnType<typeof useAuthStore.getState>["user"]) => void,
  setProfile: (profile: ReturnType<typeof useAuthStore.getState>["profile"]) => void,
  setLoading: (isLoading: boolean) => void,
  setInitialized: (isInitialized: boolean) => void,
) {
  setLoading(true);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  setUser(user);

  if (user) {
    const profile = await fetchProfile(supabase, user.id);
    setProfile(profile);
  } else {
    setProfile(null);
  }

  setLoading(false);
  setInitialized(true);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setProfile = useAuthStore((state) => state.setProfile);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const reset = useAuthStore((state) => state.reset);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      reset();
      return;
    }

    const client = createClient();
    if (!client) {
      reset();
      return;
    }

    void loadSession(client, setUser, setProfile, setLoading, setInitialized);

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);

      if (nextUser) {
        const profile = await fetchProfile(client, nextUser.id);
        setProfile(profile);
      } else {
        setProfile(null);
      }

      setLoading(false);
      setInitialized(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [reset, setInitialized, setLoading, setProfile, setUser]);

  return <>{children}</>;
}
