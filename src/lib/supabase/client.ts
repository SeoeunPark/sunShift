import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "./config";

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!client) {
    client = createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
  }

  return client;
}
