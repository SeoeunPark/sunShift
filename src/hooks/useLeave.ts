"use client";

import { useCallback, useEffect, useState } from "react";
import { leaveRepository } from "@/lib/repositories";
import type { CreateLeaveInput, LeaveRecord, UpdateLeaveInput } from "@/types/local";
import { useActiveUserId } from "./useActiveUserId";

export function useLeave() {
  const userId = useActiveUserId();
  const [records, setRecords] = useState<LeaveRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await leaveRepository.getAll(userId);
        if (!cancelled) {
          setRecords(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "연차 데이터를 불러오지 못했습니다.");
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
    async (input: CreateLeaveInput) => {
      const created = await leaveRepository.create(userId, input);
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
    async (id: string, input: UpdateLeaveInput) => {
      const updated = await leaveRepository.update(userId, id, input);
      setRecords((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    },
    [userId],
  );

  const remove = useCallback(
    async (id: string) => {
      await leaveRepository.delete(userId, id);
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
