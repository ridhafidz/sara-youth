"use client";

import { useState, useRef, useEffect } from "react";
import { Search, SlidersHorizontal, Bell, X } from "lucide-react";
import { subscribeRecentNotifications } from "@/lib/services/notifications";
import type { Notification } from "@/lib/dummy";

export function Topbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const filterRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Subscribe to real Firestore notifications
  useEffect(() => {
    const unsubscribe = subscribeRecentNotifications(
      (data) => setNotifications(data),
      (err) => console.error("[Topbar] Notifications error:", err),
    );
    return () => unsubscribe();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (filterRef.current && !filterRef.current.contains(target)) {
        setShowFilter(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setShowNotif(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

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
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Here..."
          className="w-full pl-9 pr-4 py-2 rounded-[var(--sara-radius-sm)] border border-[var(--sara-border)] bg-[var(--sara-bg)] text-sm text-[var(--sara-text-primary)] placeholder:text-[var(--sara-text-secondary)] outline-none focus:border-[var(--sara-primary)] focus:ring-2 focus:ring-[var(--sara-primary-light)] transition"
        />
      </div>

      {/* Filter wrapper */}
      <div className="relative" ref={filterRef}>
        <button
          onClick={() => {
            setShowFilter(!showFilter);
            setShowNotif(false);
          }}
          aria-label="Filter"
          className={`w-9 h-9 flex items-center justify-center rounded-[var(--sara-radius-sm)] border transition ${
            showFilter
              ? "border-[var(--sara-primary)] text-[var(--sara-primary)] bg-[var(--sara-primary-light)]"
              : "border-[var(--sara-border)] bg-[var(--sara-surface)] text-[var(--sara-text-secondary)] hover:border-[var(--sara-primary)] hover:text-[var(--sara-primary)]"
          }`}
        >
          <SlidersHorizontal size={15} strokeWidth={1.8} />
        </button>

        {showFilter && (
          <div className="absolute right-0 top-12 w-56 bg-[var(--sara-surface)] border border-[var(--sara-border)] rounded-xl shadow-lg z-50 p-4 animate-in fade-in zoom-in-95 duration-100">
            <h3 className="text-sm font-semibold text-[var(--sara-text-primary)] mb-3">Quick Filters</h3>
            <div className="space-y-2">
              {["Active Programs", "High Impact", "Needs Attention"].map((f) => (
                <label key={f} className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-4 h-4 rounded border border-[var(--sara-border)] group-hover:border-[var(--sara-primary)] transition flex items-center justify-center" />
                  <span className="text-sm text-[var(--sara-text-secondary)] group-hover:text-[var(--sara-text-primary)] transition">
                    {f}
                  </span>
                </label>
              ))}
            </div>
            <button
              onClick={() => setShowFilter(false)}
              className="mt-4 w-full py-1.5 text-xs font-semibold rounded bg-[var(--sara-primary)] text-white hover:opacity-90 transition"
            >
              Apply Filters
            </button>
          </div>
        )}
      </div>

      {/* Notification wrapper */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => {
            setShowNotif(!showNotif);
            setShowFilter(false);
          }}
          aria-label="Notifications"
          className="relative w-9 h-9 flex items-center justify-center rounded-full text-white transition hover:opacity-90"
          style={{ background: "var(--sara-primary)" }}
        >
          <Bell size={15} strokeWidth={2} />
          {/* Unread badge */}
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--sara-surface)]"
              style={{ background: "var(--sara-danger)" }}
            />
          )}
        </button>

        {showNotif && (
          <div className="absolute right-0 top-12 w-80 bg-[var(--sara-surface)] border border-[var(--sara-border)] rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-4 py-3 border-b border-[var(--sara-border)] flex justify-between items-center bg-[var(--sara-bg)]">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[var(--sara-text-primary)]">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: "var(--sara-danger)" }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowNotif(false)}
                className="text-[var(--sara-text-secondary)] hover:text-[var(--sara-text-primary)]"
              >
                <X size={14} />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-[var(--sara-text-secondary)] text-center py-6">
                  Belum ada notifikasi.
                </p>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 border-b border-[var(--sara-border)] hover:bg-[var(--sara-bg)] transition cursor-pointer ${!notif.is_read ? "border-l-2 border-l-[var(--sara-primary)]" : ""}`}
                  >
                    <p className="text-sm font-medium text-[var(--sara-text-primary)] mb-0.5">{notif.message}</p>
                    <p className="text-[10px] text-[var(--sara-primary)] font-medium">{notif.time}</p>
                  </div>
                ))
              )}
            </div>

            <div className="p-2 bg-[var(--sara-bg)]">
              <button
                onClick={() => setShowNotif(false)}
                className="w-full py-1.5 text-xs font-medium text-[var(--sara-text-secondary)] hover:text-[var(--sara-text-primary)] transition text-center"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
