"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  EmptyState,
  GoalChip,
  RiskBadge,
  ScoreCell,
  StatusBadge,
} from "@/components/shared/Badges";
import { listPrograms } from "@/lib/services/sdgPrograms";
import type { SdgProgram } from "@/lib/types/sdgProgram";

const selectClass =
  "rounded-lg border border-[var(--sara-border)] bg-[var(--sara-surface)] px-3 py-2 text-sm text-[var(--sara-text-primary)] outline-none focus:border-[#12A594]";

/**
 * Daftar program yang siap dilaporkan (tahap Report).
 *
 * Hanya program berstatus `measured` atau `reported` yang muncul, karena
 * laporan dampak tidak bisa disusun sebelum data pengukuran ada. Program
 * yang masih `draft` diarahkan ke Impact Assessment terlebih dahulu.
 */
export default function SdgsReportsPage() {
  const [programs, setPrograms] = useState<SdgProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "measured" | "reported">(
    "all",
  );

  useEffect(() => {
    async function load() {
      try {
        setPrograms(await listPrograms());
      } catch {
        setError(
          "Data program tidak bisa dimuat. Periksa koneksi, lalu muat ulang halaman.",
        );
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const reportable = useMemo(
    () => programs.filter((p) => p.status !== "draft"),
    [programs],
  );

  const notYetMeasuredCount = programs.length - reportable.length;

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return reportable.filter((program) => {
      if (statusFilter !== "all" && program.status !== statusFilter) return false;
      if (keyword) {
        const haystack = `${program.programName} ${program.organization}`.toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }
      return true;
    });
  }, [reportable, search, statusFilter]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-[var(--sara-text-primary)]">SDGs Reports</h1>
        <p className="mt-1 text-sm text-[var(--sara-text-secondary)]">
          Susun laporan dampak dari program yang sudah diukur. Tahap Report
          pada framework SARA Youth.
        </p>
      </header>

      {error && (
        <p className="rounded-lg bg-[#FEE2E2] px-4 py-3 text-sm text-[#B91C1C]">
          {error}
        </p>
      )}

      {!loading && notYetMeasuredCount > 0 && (
        <p className="rounded-lg bg-[#FEF3C7] px-4 py-3 text-sm text-[#B45309]">
          {notYetMeasuredCount} program belum bisa dilaporkan karena belum
          diukur dampaknya.{" "}
          <Link href="/impact-assessment" className="font-medium underline">
            Ukur sekarang
          </Link>
        </p>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-[var(--sara-muted-card)]" />
          ))}
        </div>
      ) : reportable.length === 0 ? (
        <EmptyState
          title="Belum ada program yang siap dilaporkan"
          description="Ukur dampak minimal satu program terlebih dahulu di halaman Impact Assessment."
          action={
            <Link
              href="/impact-assessment"
              className="inline-block rounded-lg bg-[#12A594] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0C8377]"
            >
              Buka Impact Assessment
            </Link>
          }
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <input
              className={`${selectClass} min-w-[220px] flex-1`}
              placeholder="Cari nama program atau organisasi"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className={selectClass}
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as typeof statusFilter)
              }
            >
              <option value="all">Semua status</option>
              <option value="measured">Belum dilaporkan</option>
              <option value="reported">Sudah dilaporkan</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((program) => (
              <Link
                key={program.id}
                href={`/sdgs-reports/${program.id}`}
                className="block rounded-2xl border border-[var(--sara-border)] bg-[var(--sara-surface)] p-5 transition hover:border-[#12A594]/40 hover:shadow-[0_1px_3px_rgba(16,24,40,0.08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-medium text-[var(--sara-text-primary)]">
                      {program.programName}
                    </h3>
                    <p className="mt-0.5 truncate text-xs text-[var(--sara-text-secondary)]">
                      {program.organization}
                    </p>
                  </div>
                  <GoalChip goal={program.primaryGoal} size="sm" />
                </div>

                <div className="mt-4 flex items-end justify-between gap-3">
                  <ScoreCell score={program.impactScore} />
                  <RiskBadge risk={program.riskLevel} />
                </div>

                <div className="mt-3">
                  <StatusBadge status={program.status} />
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="rounded-xl border border-dashed border-[var(--sara-border)] px-4 py-8 text-center text-sm text-[var(--sara-text-secondary)]">
              Tidak ada program yang cocok dengan filter ini.
            </p>
          )}
        </>
      )}
    </div>
  );
}
