"use client";

import { useState, useEffect } from "react";
import { subscribeLatestNotification } from "@/lib/services/notifications";
import type { Notification } from "@/lib/dummy";

interface UseNotificationResult {
  notification: Notification | null;
  loading: boolean;
  error: Error | null;
}

/**
 * React hook: real-time subscription to the latest system notification.
 *
 * • `notification` is null while loading or when Firestore returns no documents.
 * • `loading` flips to false after the first Firestore snapshot (or error).
 */
export function useLatestNotification(): UseNotificationResult {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribe = () => {};

    unsubscribe = subscribeLatestNotification(
      (data) => {
        setNotification(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { notification, loading, error };
}
