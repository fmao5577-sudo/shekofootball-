"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useApi<T>(url: string | null, refreshMs = 0) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(url));
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const hasData = useRef(false);

  const load = useCallback(async () => {
    if (!url) return;
    // Only show loading spinner on first load — keep UI snappy on refresh
    if (!hasData.current) setLoading(true);
    try {
      const isLive = url.includes("/api/live") || url.includes("/api/home");
      const response = await fetch(url, { cache: isLive ? "no-store" : "default" });
      const json = (await response.json()) as T & { error?: string };
      if (!response.ok) throw new Error(json.error || "request failed");
      setData(json);
      hasData.current = true;
      setError(null);
      setUpdatedAt(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "error");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    void load();
    if (!refreshMs) return;
    const timer = window.setInterval(() => void load(), refreshMs);
    return () => window.clearInterval(timer);
  }, [load, refreshMs]);

  return { data, error, loading, reload: load, updatedAt };
}
