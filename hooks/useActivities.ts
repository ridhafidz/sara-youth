"use client";

import { useState, useEffect } from "react";
import { subscribeActivities } from "@/lib/services/activities";
import type { Activity } from "@/lib/dummy";

interface UseActivitiesResult {
  activities: Activity[];
  loading: boolean;
  error: Error | null;
}

/**
 * React hook: real-time Firestore activities subscription.
 *
 * • Falls back to dummy data if Firebase is not configured.
 * • Cleans up the onSnapshot listener on unmount.
 */
export function useActivities(): UseActivitiesResult {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribe = () => {};

    unsubscribe = subscribeActivities(
      (data) => {
        setActivities(data);
        setLoading(false);
      },
      (err: any) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { activities, loading, error };
}
