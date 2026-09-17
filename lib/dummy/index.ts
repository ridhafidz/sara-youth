// ─── Shared types ─────────────────────────────────────────────────────────────
// Dummy data for schedules / activities / notifications has been removed.
// Those collections are now read directly from Firestore.
// DUMMY_USER stays until Firebase Auth is wired up in RightPanel.

export interface Schedule {
  id: string;
  title: string;
  description: string;
  day: number;
  month: string;
  year: number;
  is_upcoming: boolean;
}

export interface Activity {
  id: string;
  title: string;
  status: "active" | "pending" | "done";
  icon: string;
  /** Relative time label, e.g. "Just now", "2h ago" */
  time: string;
}

export interface Notification {
  id: string;
  message: string;
  is_read: boolean;
  time: string;
}

/** Temporary placeholder — replace with Firebase Auth currentUser in Day 4 */
export const DUMMY_USER = {
  name: "Admin",
  role: "admin",
  avatar: null,
};
