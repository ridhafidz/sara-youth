"use client";

import { Bell, CheckCircle2, MoreHorizontal, Info } from "lucide-react";
import { useLatestNotification } from "@/hooks/useNotification";
import { useState, useRef, useEffect } from "react";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div
      className="rounded-[var(--sara-radius-md)] p-4 space-y-2 animate-pulse"
      style={{ background: "var(--sara-muted-card)" }}
    >
      <div className="h-3 w-24 rounded" style={{ background: "var(--sara-border)" }} />
      <div className="h-4 w-full rounded" style={{ background: "var(--sara-border)" }} />
      <div className="h-4 w-3/4 rounded" style={{ background: "var(--sara-border)" }} />
      <div className="h-3 w-16 rounded mt-1" style={{ background: "var(--sara-border)" }} />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function SystemNotification() {
  const { notification, loading, error } = useLatestNotification();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section aria-labelledby="notif-heading">
      <div className="flex items-center justify-between mb-3">
        <h2
          id="notif-heading"
          className="text-sm font-semibold text-[var(--sara-text-primary)]"
        >
          System Notification
        </h2>
        <div className="relative" ref={menuRef}>
          <button
            aria-label="More notification options"
            onClick={() => setShowMenu(!showMenu)}
            className="text-[var(--sara-text-secondary)] hover:text-[var(--sara-text-primary)] transition-colors p-1 rounded-md hover:bg-[var(--sara-bg)]"
          >
            <MoreHorizontal size={16} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-7 w-52 bg-[var(--sara-surface)] border border-[var(--sara-border)] rounded-xl shadow-lg z-20 p-3 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-start gap-2">
                <Info size={13} className="text-[var(--sara-primary)] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[var(--sara-text-secondary)] leading-snug">
                  Notifikasi ini sumber datanya sama dengan notifikasi di topbar — keduanya terhubung ke Firestore secara real-time.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <NotificationSkeleton />
      ) : error ? (
        <div className="flex flex-col gap-1 px-3 py-2.5 rounded-[var(--sara-radius-sm)] bg-red-50 text-red-600 text-xs">
          <span className="font-semibold">Failed to load notification</span>
          <span className="opacity-80">{error.message}</span>
        </div>
      ) : !notification ? (
        <p className="text-xs text-[var(--sara-text-secondary)] italic">
          No notifications yet.
        </p>
      ) : (
        <div
          className="rounded-[var(--sara-radius-md)] p-4 relative overflow-hidden"
          style={{ background: "var(--sara-primary)" }}
        >
          {/* Decorative circles */}
          <div
            className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10"
            style={{ background: "#fff" }}
          />
          <div
            className="absolute -right-2 -bottom-2 w-12 h-12 rounded-full opacity-10"
            style={{ background: "#fff" }}
          />

          {/* Bell row */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              <Bell size={12} className="text-white" />
            </div>
            <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">
              Latest Update
            </p>
          </div>

          {/* Message */}
          <p className="text-sm text-white font-semibold leading-snug relative z-10">
            {notification.message}
          </p>

          {/* Status + time */}
          <div className="mt-3 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={11} style={{ color: "var(--sara-success)" }} />
              <span className="text-[10px] text-white/70 font-medium">
                {notification.is_read ? "Read" : "New notification"}
              </span>
            </div>
            {"time" in notification && (
              <span className="text-[10px] text-white/50">{notification.time}</span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
