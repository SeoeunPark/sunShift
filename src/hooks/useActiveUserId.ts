import { useAuthStore } from "@/stores/authStore";
import { resolveUserId } from "@/lib/repositories/getUserId";

export function useActiveUserId(): string {
  const userId = useAuthStore((state) => state.user?.id);
  return resolveUserId(userId);
}
