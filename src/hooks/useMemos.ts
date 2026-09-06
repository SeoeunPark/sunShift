"use client";

import { useCallback, useEffect, useState } from "react";
import { memoRepository } from "@/lib/repositories";
import type { CreateMemoInput, MemoRecord, UpdateMemoInput } from "@/types/local";
import { useActiveUserId } from "./useActiveUserId";

export function useMemos() {
  const userId = useActiveUserId();
  const [records, setRecords] = useState<MemoRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await memoRepository.getAll(userId);
        if (!cancelled) {
          setRecords(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "메모를 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [userId, reloadToken]);

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  const create = useCallback(
    async (input: CreateMemoInput) => {
      const created = await memoRepository.create(userId, input);
      setRecords((prev) =>
        [...prev.filter((item) => item.id !== created.id), created].sort((a, b) =>
          a.date.localeCompare(b.date),
        ),
      );
      return created;
    },
    [userId],
  );

  const update = useCallback(
    async (id: string, input: UpdateMemoInput) => {
      const updated = await memoRepository.update(userId, id, input);
      setRecords((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    },
    [userId],
  );

  const remove = useCallback(
    async (id: string) => {
      await memoRepository.delete(userId, id);
      setRecords((prev) => prev.filter((item) => item.id !== id));
    },
    [userId],
  );

  const getByDate = useCallback(
    (date: string) => records.find((item) => item.date === date) ?? null,
    [records],
  );

  return {
    records,
    isLoading,
    error,
    reload,
    create,
    update,
    remove,
    getByDate,
  };
}
