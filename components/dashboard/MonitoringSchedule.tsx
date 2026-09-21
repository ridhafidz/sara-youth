"use client";

import { useState, useRef, useEffect } from "react";
import { CalendarDays, MoreHorizontal, Clock, AlertCircle, Plus, X, Trash2 } from "lucide-react";
import { useSchedules } from "@/hooks/useSchedules";
import { addSchedule } from "@/lib/services/schedules";
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

// ── Add Schedule Modal ─────────────────────────────────────────────────────────

function AddScheduleModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      setError("Judul dan tanggal wajib diisi.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await addSchedule(title.trim(), new Date(date), description.trim() || undefined);
      onClose();
    } catch (err: any) {
      setError("Gagal menyimpan jadwal. Cek koneksi dan permissions Firebase.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative w-full max-w-sm bg-[var(--sara-surface)] rounded-2xl shadow-2xl border border-[var(--sara-border)] p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-[var(--sara-text-primary)]">Tambah Jadwal</h2>
          <button
            onClick={onClose}
            className="text-[var(--sara-text-secondary)] hover:text-[var(--sara-text-primary)] transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--sara-text-primary)] mb-1.5">
              Judul Jadwal <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Kunjungan Lapangan Desa A"
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--sara-border)] text-sm text-[var(--sara-text-primary)] bg-[var(--sara-bg)] outline-none focus:border-[var(--sara-primary)] focus:ring-2 focus:ring-[var(--sara-primary-light)] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--sara-text-primary)] mb-1.5">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--sara-border)] text-sm text-[var(--sara-text-primary)] bg-[var(--sara-bg)] outline-none focus:border-[var(--sara-primary)] focus:ring-2 focus:ring-[var(--sara-primary-light)] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--sara-text-primary)] mb-1.5">
              Keterangan <span className="text-[var(--sara-text-secondary)]">(opsional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Evaluasi program air bersih"
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--sara-border)] text-sm text-[var(--sara-text-primary)] bg-[var(--sara-bg)] outline-none focus:border-[var(--sara-primary)] focus:ring-2 focus:ring-[var(--sara-primary-light)] transition"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 font-medium">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-[var(--sara-border)] text-[var(--sara-text-secondary)] hover:bg-[var(--sara-bg)] transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--sara-primary)" }}
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function MonitoringSchedule() {
  const { schedules, loading, error } = useSchedules();
  const [showMenu, setShowMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
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
    <>
      <section aria-labelledby="schedule-heading">
        <div className="flex items-center justify-between mb-3">
          <h2
            id="schedule-heading"
            className="text-sm font-semibold text-[var(--sara-text-primary)]"
          >
            Monitoring Schedule
          </h2>
          <div className="relative" ref={menuRef}>
            <button
              aria-label="More schedule options"
              onClick={() => setShowMenu(!showMenu)}
              className="text-[var(--sara-text-secondary)] hover:text-[var(--sara-text-primary)] transition-colors p-1 rounded-md hover:bg-[var(--sara-bg)]"
            >
              <MoreHorizontal size={16} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-7 w-44 bg-[var(--sara-surface)] border border-[var(--sara-border)] rounded-xl shadow-lg z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => { setShowAddModal(true); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[var(--sara-text-secondary)] hover:bg-[var(--sara-bg)] hover:text-[var(--sara-primary)] transition"
                >
                  <Plus size={14} />
                  Tambah Jadwal
                </button>
              </div>
            )}
          </div>
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
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <CalendarDays size={28} className="text-[var(--sara-text-secondary)] opacity-40" />
            <p className="text-xs text-[var(--sara-text-secondary)]">Belum ada jadwal monitoring.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-xs font-semibold text-[var(--sara-primary)] hover:underline flex items-center gap-1"
            >
              <Plus size={12} /> Tambah jadwal
            </button>
          </div>
        )}

        {!loading && schedules.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5">
            {schedules.map((s) => (
              <ScheduleCard key={s.id} schedule={s} />
            ))}
          </div>
        )}
      </section>

      {showAddModal && (
        <AddScheduleModal onClose={() => setShowAddModal(false)} />
      )}
    </>
  );
}
