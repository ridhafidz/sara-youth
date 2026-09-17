/**
 * Firestore service: schedules collection
 *
 * Collection: `schedules`
 * Ordered by: `date` ascending
 */

import {
  collection,
  query,
  orderBy,
  getDocs,
  onSnapshot,
  type Unsubscribe,
  type QuerySnapshot,
  type DocumentData,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Schedule } from "@/lib/dummy";
import type { FirestoreSchedule } from "@/lib/types/firestore";

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapDoc(id: string, data: FirestoreSchedule): Schedule {
  // Firestore Timestamp → Date → extract month/year if needed
  const date =
    typeof data.date === "string"
      ? new Date(data.date)
      : data.date?.toDate?.() ?? new Date();

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun",
                      "Jul","Aug","Sep","Oct","Nov","Dec"];

  return {
    id,
    title: data.title,
    description: data.description ?? "",
    day: date.getDate(),
    month: data.month ?? monthNames[date.getMonth()],
    year: data.year ?? date.getFullYear(),
    is_upcoming: data.is_upcoming ?? date > new Date(),
  };
}

function snapshotToSchedules(snap: QuerySnapshot<DocumentData>): Schedule[] {
  return snap.docs.map((d) => mapDoc(d.id, d.data() as FirestoreSchedule));
}

// ── One-shot fetch ────────────────────────────────────────────────────────────

export async function getSchedules(): Promise<Schedule[]> {
  try {
    const q = query(collection(getDb(), "schedules"), orderBy("date", "asc"));
    const snap = await getDocs(q);
    return snapshotToSchedules(snap);
  } catch (err) {
    console.error("[SARA] getSchedules error:", err);
    throw err;
  }
}

// ── Real-time listener ────────────────────────────────────────────────────────

export function subscribeSchedules(
  callback: (schedules: Schedule[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(collection(getDb(), "schedules"), orderBy("date", "asc"));

  return onSnapshot(
    q,
    (snap) => callback(snapshotToSchedules(snap)),
    (err) => {
      console.error("[SARA] subscribeSchedules error:", err);
      onError?.(err);
    },
  );
}
