"use client";

import { useState, useEffect, useCallback } from "react";

interface Activity {
  id: string;
  userId: string;
  type: string;
  amount: string;
  tokenSymbol: string;
  vaultId: string | null;
  txHash: string | null;
  createdAt: string;
}

export function useActivities(limit = 20) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch(`/api/activity?limit=${limit}`);
      if (!res.ok) return;
      const data = await res.json();
      setActivities(data.activities || []);
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/activity?limit=${limit}`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled) setActivities(data.activities || []);
      } catch {
        // silent fail
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [limit]);

  return { activities, isLoading, refetch };
}
