"use client";

import { CalendarDays, MoreHorizontal, Clock, AlertCircle } from "lucide-react";
import { useSchedules } from "@/hooks/useSchedules";
import type { Schedule } from "@/lib/dummy";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ScheduleSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="rounded-[var(--sara-radius-md)] p-3.5 h-[130px]"
          style={{ background: "var(--sara-muted-card)" }}
        >
          <div className="animate-pulse space-y-2">
            <div className="h-2 w-14 rounded" style={{ background: "var(--sara-border)" }} />
            <div className="h-9 w-8 rounded" style={{ background: "var(--sara-border)" }} />
            <div className="h-2 w-full rounded" style={{ background: "var(--sara-border)" }} />
            <div className="h-2 w-3/4 rounded" style={{ background: "var(--sara-border)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Date Card ─────────────────────────────────────────────────────────────────

function ScheduleCard({ schedule }: { schedule: Schedule }) {
  const upcoming = schedule.is_upcoming;
  return (
    <div
      className="relative rounded-[var(--sara-radius-md)] p-3.5 flex flex-col gap-0.5 overflow-hidden cursor-pointer transition-all duration-150 hover:brightness-95"
      style={{
        background: upcoming ? "var(--sara-primary)" : "var(--sara-muted-card)",
        boxShadow: upcoming ? "0 4px 14px rgba(18,165,148,0.3)" : "none",
      }}
    >
      {/* Decorative circle */}
      <div
        className="absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-10"
        style={{ background: upcoming ? "#fff" : "var(--sara-text-secondary)" }}
      />

      {/* Month + Year */}
      <div className="flex items-center gap-1">
        <CalendarDays
          size={10}
          style={{ color: upcoming ? "rgba(255,255,255,0.6)" : "var(--sara-text-secondary)" }}
        />
        <p
          className="text-[10px] font-semibold uppercase tracking-wider leading-none"
          style={{ color: upcoming ? "rgba(255,255,255,0.65)" : "var(--sara-text-secondary)" }}
        >
          {schedule.month} {schedule.year}
        </p>
      </div>

      {/* Day number */}
      <p
        className="text-[38px] font-extrabold leading-none tracking-tight mt-1"
        style={{ color: upcoming ? "#fff" : "var(--sara-text-secondary)" }}
      >
        {schedule.day}
      </p>

      {/* Event title */}
      <p
        className="text-[10px] font-semibold leading-snug mt-1.5"
        style={{ color: upcoming ? "rgba(255,255,255,0.9)" : "var(--sara-text-secondary)" }}
      >
        {schedule.title}
      </p>

      {/* Event description */}
      {schedule.description && (
        <p
          className="text-[9px] leading-snug opacity-75"
          style={{ color: upcoming ? "rgba(255,255,255,0.55)" : "var(--sara-text-secondary)" }}
        >
          {schedule.description}
        </p>
      )}

      {/* Upcoming badge */}
      {upcoming && (
        <div className="mt-2 flex items-center gap-1">
          <Clock size={8} className="text-white/60" />
          <span className="text-[9px] text-white/60 font-medium">Upcoming</span>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function MonitoringSchedule() {
  const { schedules, loading, error } = useSchedules();

  return (
    <section aria-labelledby="schedule-heading">
      <div className="flex items-center justify-between mb-3">
        <h2
          id="schedule-heading"
          className="text-sm font-semibold text-[var(--sara-text-primary)]"
        >
          Monitoring Schedule
        </h2>
        <button
          aria-label="More schedule options"
          className="text-[var(--sara-text-secondary)] hover:text-[var(--sara-text-primary)] transition-colors"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Loading */}
      {loading && <ScheduleSkeleton />}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col gap-1 px-4 py-3 rounded-[var(--sara-radius-md)] bg-red-50 text-red-600 text-xs mt-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} />
            <span className="font-semibold">Failed to load schedules</span>
          </div>
          <span className="opacity-80 ml-5">{error.message}</span>
        </div>
      )}

      {/* Data */}
      {!loading && !error && schedules.length === 0 && (
        <p className="text-xs text-[var(--sara-text-secondary)] py-3 text-center">
          Tidak ada jadwal monitoring.
        </p>
      )}

      {!loading && schedules.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5">
          {schedules.map((s) => (
            <ScheduleCard key={s.id} schedule={s} />
          ))}
        </div>
      )}
    </section>
  );
}
