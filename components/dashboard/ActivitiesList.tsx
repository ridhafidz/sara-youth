"use client";

import {
  FileCheck,
  Map,
  BarChart2,
  Zap,
  MoreHorizontal,
  AlertCircle,
  Info,
  type LucideIcon,
} from "lucide-react";
import { useActivities } from "@/hooks/useActivities";
import type { Activity } from "@/lib/dummy";
import { useState, useRef, useEffect } from "react";

// ── Icon & Status registries ──────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  FileCheck,
  Map,
  BarChart2,
  Zap,
};

const STATUS_STYLES: Record<Activity["status"], { dot: string; label: string }> = {
  active:  { dot: "var(--sara-success)",        label: "Active"  },
  pending: { dot: "var(--sara-warning)",         label: "Pending" },
  done:    { dot: "var(--sara-text-secondary)",  label: "Done"    },
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ActivitiesSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
          style={{ background: "var(--sara-muted-card)" }}
        >
          <div
            className="w-6 h-6 rounded-md shrink-0 animate-pulse"
            style={{ background: "var(--sara-border)" }}
          />
          <div className="flex-1 space-y-1.5 animate-pulse">
            <div className="h-2.5 rounded" style={{ background: "var(--sara-border)", width: `${60 + i * 8}%` }} />
            <div className="h-1.5 w-20 rounded" style={{ background: "var(--sara-border)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Activity Row ──────────────────────────────────────────────────────────────

function ActivityRow({
  activity,
  isPinned,
}: {
  activity: Activity;
  isPinned: boolean;
}) {
  const Icon   = ICON_MAP[activity.icon] ?? FileCheck;
  const status = STATUS_STYLES[activity.status];

  return (
    <div
      className="group flex items-start gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 hover:scale-[1.01]"
      style={
        isPinned
          ? {
              background: "var(--sara-primary)",
              boxShadow: "0 4px 12px rgba(18,165,148,0.25)",
            }
          : {
              background: "var(--sara-primary-light)",
              border: "1px solid rgba(18,165,148,0.15)",
            }
      }
      role="listitem"
      aria-label={activity.title}
    >
      {/* Icon box */}
      <span
        className="mt-0.5 w-6 h-6 rounded-md flex items-center justify-center shrink-0"
        style={
          isPinned
            ? { background: "rgba(255,255,255,0.2)" }
            : { background: "rgba(18,165,148,0.12)" }
        }
      >
        <Icon
          size={13}
          strokeWidth={1.8}
          style={{ color: isPinned ? "#fff" : "var(--sara-primary)" }}
        />
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-semibold leading-snug truncate"
          style={{ color: isPinned ? "#fff" : "var(--sara-text-primary)" }}
        >
          {activity.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: isPinned ? "rgba(255,255,255,0.6)" : status.dot }}
          />
          <span
            className="text-[10px] font-medium"
            style={{ color: isPinned ? "rgba(255,255,255,0.65)" : "var(--sara-text-secondary)" }}
          >
            {status.label}
          </span>
          <span
            className="text-[10px] opacity-70"
            style={{ color: isPinned ? "rgba(255,255,255,0.45)" : "var(--sara-text-secondary)" }}
          >
            · {activity.time}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function ActivitiesList() {
  const { activities, loading, error } = useActivities();
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
    <section aria-labelledby="activities-heading">
      <div className="flex items-center justify-between mb-3">
        <h2
          id="activities-heading"
          className="text-sm font-semibold text-[var(--sara-text-primary)]"
        >
          Activities
        </h2>
        <div className="relative" ref={menuRef}>
          <button
            aria-label="More activity options"
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
                  Aktivitas dicatat otomatis dari aksi yang dilakukan admin, seperti menambah atau mengubah program SDGs.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && <ActivitiesSkeleton />}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col gap-1 px-3 py-2.5 rounded-[var(--sara-radius-sm)] bg-red-50 text-red-600 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={13} />
            <span className="font-semibold">Failed to load activities</span>
          </div>
          <span className="opacity-80 ml-5">{error.message}</span>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && activities.length === 0 && (
        <p className="text-xs text-[var(--sara-text-secondary)] py-3 text-center">
          Belum ada aktivitas.
        </p>
      )}

      {/* Data */}
      {!loading && activities.length > 0 && (
        <div role="list" className="flex flex-col gap-2">
          {activities.map((activity, i) => (
            <ActivityRow key={activity.id} activity={activity} isPinned={i === 0} />
          ))}
        </div>
      )}
    </section>
  );
}
