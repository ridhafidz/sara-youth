/**
 * Firestore service: notifications collection
 *
 * Collection: `notifications`
 * Latest unread first — ordered by `created_at` desc, limit 1
 */

import {
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
  type QuerySnapshot,
  type DocumentData,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Notification } from "@/lib/dummy";
import type { FirestoreNotification } from "@/lib/types/firestore";

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapDoc(id: string, data: FirestoreNotification): Notification {
  const createdAt =
    typeof data.created_at === "string"
      ? new Date(data.created_at)
      : data.created_at?.toDate?.() ?? new Date();

  const diffMin = Math.floor((Date.now() - createdAt.getTime()) / 60000);
  const time =
    diffMin < 1     ? "Just now"
    : diffMin < 60  ? `${diffMin}m ago`
    : diffMin < 1440 ? `${Math.floor(diffMin / 60)}h ago`
    : `${Math.floor(diffMin / 1440)}d ago`;

  return {
    id,
    message: data.message,
    is_read: data.is_read ?? false,
    time,
  };
}

function snapshotToNotification(snap: QuerySnapshot<DocumentData>): Notification | null {
  if (snap.empty) return null;
  const d = snap.docs[0];
  return mapDoc(d.id, d.data() as FirestoreNotification);
}

// ── Writer ───────────────────────────────────────────────────────────────────

export async function addNotification(message: string): Promise<void> {
  await addDoc(collection(getDb(), "notifications"), {
    message,
    is_read: false,
    created_at: serverTimestamp(),
  });
}

// ── Real-time listener (latest notification) ──────────────────────────────────

export function subscribeLatestNotification(
  callback: (notification: Notification | null) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(
    collection(getDb(), "notifications"),
    orderBy("created_at", "desc"),
    limit(1),
  );

  return onSnapshot(
    q,
    (snap) => callback(snapshotToNotification(snap)),
    (err) => {
      console.error("[SARA] subscribeLatestNotification error:", err);
      onError?.(err);
    },
  );
}

// ── Real-time listener (recent 10 notifications — for Topbar) ─────────────────

function snapshotToNotifications(snap: QuerySnapshot<DocumentData>): Notification[] {
  return snap.docs.map((d) => mapDoc(d.id, d.data() as FirestoreNotification));
}

export function subscribeRecentNotifications(
  callback: (notifications: Notification[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(
    collection(getDb(), "notifications"),
    orderBy("created_at", "desc"),
    limit(10),
  );

  return onSnapshot(
    q,
    (snap) => callback(snapshotToNotifications(snap)),
    (err) => {
      console.error("[SARA] subscribeRecentNotifications error:", err);
      onError?.(err);
    },
  );
}
