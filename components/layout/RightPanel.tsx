/**
 * RightPanel — Server Component shell.
 *
 * Renders:
 *  • Admin Profile (static — will connect to Firebase Auth context later)
 *  • MonitoringSchedule  ← Client Component (real-time Firestore)
 *  • ActivitiesList      ← Client Component (real-time Firestore)
 *  • SystemNotification  ← Client Component (real-time Firestore)
 */

import { MoreHorizontal } from "lucide-react";
import { MonitoringSchedule } from "@/components/dashboard/MonitoringSchedule";
import { ActivitiesList } from "@/components/dashboard/ActivitiesList";
import { SystemNotification } from "@/components/dashboard/SystemNotification";
import { DUMMY_USER } from "@/lib/dummy";

function PanelDivider() {
  return <hr style={{ borderColor: "var(--sara-border)" }} />;
}

export function RightPanel() {
  return (
    <aside
      className="flex flex-col gap-5 px-4 py-6 bg-[var(--sara-surface)] border-l border-[var(--sara-border)] overflow-y-auto"
      style={{ width: 300 }}
      aria-label="Right panel"
    >
      {/* ── Admin Profile (static — replace with Auth context in Day 4) ── */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ring-2 ring-[var(--sara-primary-light)]"
          style={{ background: "var(--sara-primary)" }}
          aria-label={`Avatar for ${DUMMY_USER.name}`}
        >
          {DUMMY_USER.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--sara-text-primary)] truncate">
            {DUMMY_USER.name}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--sara-success)" }}
            />
            <p className="text-[10px] text-[var(--sara-text-secondary)] capitalize">
              {DUMMY_USER.role} · Online
            </p>
          </div>
        </div>

        <button
          aria-label="Profile options"
          className="text-[var(--sara-text-secondary)] hover:text-[var(--sara-text-primary)] transition-colors"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      <PanelDivider />

      {/* ── Real-time: Monitoring Schedule ── */}
      <MonitoringSchedule />

      <PanelDivider />

      {/* ── Real-time: Activities ── */}
      <ActivitiesList />

      <PanelDivider />

      {/* ── Real-time: System Notification ── */}
      <SystemNotification />
    </aside>
  );
}
