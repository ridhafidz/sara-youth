"use client";

import { useState, useEffect } from "react";
import { subscribeSchedules } from "@/lib/services/schedules";
import type { Schedule } from "@/lib/dummy";

interface UseSchedulesResult {
  schedules: Schedule[];
  loading: boolean;
  error: Error | null;
}

/**
 * React hook: real-time Firestore schedules subscription.
 *
 * • Falls back to dummy data if Firebase is not configured.
 * • Cleans up the onSnapshot listener on unmount.
 * • `loading` is true only on first fetch — subsequent updates
 *   arrive without showing a spinner (seamless real-time).
 */
export function useSchedules(): UseSchedulesResult {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribe = () => {};

    unsubscribe = subscribeSchedules(
      (data) => {
        setSchedules(data);
        setLoading(false);
      },
      (err: any) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { schedules, loading, error };
}
