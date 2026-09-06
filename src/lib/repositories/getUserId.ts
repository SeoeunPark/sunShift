import { LOCAL_USER_ID } from "@/lib/db/constants";

/** Resolve active user id: authenticated user or local anonymous id */
export function resolveUserId(authUserId?: string | null): string {
  return authUserId ?? LOCAL_USER_ID;
}

export function isLocalUser(userId: string): boolean {
  return userId === LOCAL_USER_ID;
}
