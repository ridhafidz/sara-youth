"use client";

import { Search, SlidersHorizontal, Bell } from "lucide-react";

export function Topbar() {
  return (
    <header className="flex items-center gap-3 px-6 py-4 bg-[var(--sara-surface)] border-b border-[var(--sara-border)] sticky top-0 z-10">
      {/* Search input */}
      <div className="flex-1 relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sara-text-secondary)] pointer-events-none"
        />
        <input
          id="topbar-search"
          type="search"
          placeholder="Search Here"
          className="w-full pl-9 pr-4 py-2 rounded-[var(--sara-radius-sm)] border border-[var(--sara-border)] bg-[var(--sara-bg)] text-sm text-[var(--sara-text-primary)] placeholder:text-[var(--sara-text-secondary)] outline-none focus:border-[var(--sara-primary)] focus:ring-2 focus:ring-[var(--sara-primary-light)] transition"
        />
      </div>

      {/* Filter button */}
      <button
        aria-label="Filter"
        className="w-9 h-9 flex items-center justify-center rounded-[var(--sara-radius-sm)] border border-[var(--sara-border)] bg-[var(--sara-surface)] text-[var(--sara-text-secondary)] hover:border-[var(--sara-primary)] hover:text-[var(--sara-primary)] transition"
      >
        <SlidersHorizontal size={15} strokeWidth={1.8} />
      </button>

      {/* Bell / notification button */}
      <button
        aria-label="Notifications"
        className="relative w-9 h-9 flex items-center justify-center rounded-full text-white transition hover:opacity-90"
        style={{ background: "var(--sara-primary)" }}
      >
        <Bell size={15} strokeWidth={2} />
        {/* Unread badge */}
        <span
          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--sara-surface)]"
          style={{ background: "var(--sara-danger)" }}
        />
      </button>
    </header>
  );
}
