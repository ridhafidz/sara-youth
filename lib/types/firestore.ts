/**
 * TypeScript interfaces that mirror the Firestore schema defined in DESIGN.md §7.
 * These are the "wire" types — raw Firestore documents before mapping to app types.
 */

import type { Timestamp } from "firebase/firestore";

// ─── collections/schedules ────────────────────────────────────────────────────
export interface FirestoreSchedule {
  title: string;
  description?: string;
  /** Firestore Timestamp or ISO string (for seeding via Console) */
  date: Timestamp | string;
  month: string;   // e.g. "Sep"
  year: number;
  is_upcoming: boolean;
}

// ─── collections/activities ───────────────────────────────────────────────────
export interface FirestoreActivity {
  title: string;
  status: "active" | "pending" | "done";
  /** Lucide icon name key, e.g. "FileCheck" */
  icon: string;
  created_at: Timestamp | string;
}

// ─── collections/notifications ────────────────────────────────────────────────
export interface FirestoreNotification {
  message: string;
  is_read: boolean;
  created_at: Timestamp | string;
}

// ─── collections/users ────────────────────────────────────────────────────────
export interface FirestoreUser {
  uid: string;
  name: string;
  role: string;
  avatar_url?: string;
}
