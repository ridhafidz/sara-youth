/**
 * Firestore service: activities collection
 *
 * Collection: `activities`
 * Ordered by: `created_at` descending (newest first)
 * Limit: 10
 */

import {
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
  type QuerySnapshot,
  type DocumentData,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Activity } from "@/lib/dummy";
import type { FirestoreActivity } from "@/lib/types/firestore";

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr  = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr  / 24);

  if (diffSec < 60)  return "Just now";
  if (diffMin < 60)  return `${diffMin}m ago`;
  if (diffHr  < 24)  return `${diffHr}h ago`;
  if (diffDay === 1) return "Yesterday";
  return `${diffDay}d ago`;
}

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapDoc(id: string, data: FirestoreActivity): Activity {
  const createdAt =
    typeof data.created_at === "string"
      ? new Date(data.created_at)
      : data.created_at?.toDate?.() ?? new Date();

  return {
    id,
    title: data.title,
    status: data.status ?? "pending",
    icon: data.icon ?? "FileCheck",
    time: relativeTime(createdAt),
  };
}

function snapshotToActivities(snap: QuerySnapshot<DocumentData>): Activity[] {
  return snap.docs.map((d) => mapDoc(d.id, d.data() as FirestoreActivity));
}

// ── Writer ───────────────────────────────────────────────────────────────────

export async function addActivity(
  title: string,
  status: "active" | "pending" | "done" = "active",
  icon: string = "FileCheck",
): Promise<void> {
  await addDoc(collection(getDb(), "activities"), {
    title,
    status,
    icon,
    created_at: serverTimestamp(),
  });
}

// ── One-shot fetch ────────────────────────────────────────────────────────────

export async function getActivities(): Promise<Activity[]> {
  try {
    const q = query(
      collection(getDb(), "activities"),
      orderBy("created_at", "desc"),
      limit(10),
    );
    const snap = await getDocs(q);
    return snapshotToActivities(snap);
  } catch (err) {
    console.error("[SARA] getActivities error:", err);
    throw err;
  }
}

// ── Real-time listener ────────────────────────────────────────────────────────

export function subscribeActivities(
  callback: (activities: Activity[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(
    collection(getDb(), "activities"),
    orderBy("created_at", "desc"),
    limit(10),
  );

  return onSnapshot(
    q,
    (snap) => callback(snapshotToActivities(snap)),
    (err) => {
      console.error("[SARA] subscribeActivities error:", err);
      onError?.(err);
    },
  );
}
