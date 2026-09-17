import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings — SARA" };

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-[var(--sara-text-primary)]">Settings</h1>
      <div
        className="rounded-[var(--sara-radius-md)] bg-[var(--sara-surface)] border border-[var(--sara-border)] p-12 flex items-center justify-center"
        style={{ boxShadow: "var(--sara-shadow-card)" }}
      >
        <p className="text-sm text-[var(--sara-text-secondary)]">
          Settings content — coming soon
        </p>
      </div>
    </div>
  );
}
