"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  EmptyState,
  GoalChip,
  RiskBadge,
  ScoreCell,
} from "@/components/shared/Badges";
import { listPrograms } from "@/lib/services/sdgPrograms";
import type { SdgProgram } from "@/lib/types/sdgProgram";

function ProgramCard({ program }: { program: SdgProgram }) {
  return (
    <Link
      href={`/impact-assessment/${program.id}`}
      className="block rounded-2xl border border-[#ECEEF0] bg-white p-5 transition hover:border-[#12A594]/40 hover:shadow-[0_1px_3px_rgba(16,24,40,0.08)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-medium text-[#16191D]">
            {program.programName}
          </h3>
          <p className="mt-0.5 truncate text-xs text-[#8A9099]">
            {program.organization}
          </p>
        </div>
        <GoalChip goal={program.primaryGoal} size="sm" />
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <ScoreCell score={program.impactScore} />
        <RiskBadge risk={program.riskLevel} />
      </div>
    </Link>
  );
}

export default function ImpactAssessmentPage() {
  const [programs, setPrograms] = useState<SdgProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const pending = programs.filter((p) => p.status === "draft");
  const assessed = programs.filter((p) => p.status !== "draft");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-[#16191D]">
          Impact Assessment
        </h1>
        <p className="mt-1 text-sm text-[#8A9099]">
          Petakan program ke target SDGs, isi capaian indikator, dan hitung
          Impact Score. Tahap Measure pada framework SARA Youth.
        </p>
      </header>

      {error && (
        <p className="rounded-lg bg-[#FEE2E2] px-4 py-3 text-sm text-[#B91C1C]">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-[#F1F3F4]" />
          ))}
        </div>
      ) : programs.length === 0 ? (
        <EmptyState
          title="Belum ada program untuk dinilai"
          description="Tambahkan program terlebih dahulu di halaman SDGs Programs, lalu kembali ke sini untuk mengukur dampaknya."
          action={
            <Link
              href="/sdgs-programs"
              className="inline-block rounded-lg bg-[#12A594] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0C8377]"
            >
              Buka SDGs Programs
            </Link>
          }
        />
      ) : (
        <>
          <section>
            <h2 className="mb-3 text-sm font-medium text-[#16191D]">
              Menunggu penilaian
              <span className="ml-2 rounded-full bg-[#F1F3F4] px-2 py-0.5 text-xs text-[#5B6269]">
                {pending.length}
              </span>
            </h2>
            {pending.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#D7DBDF] px-4 py-6 text-center text-sm text-[#8A9099]">
                Semua program sudah diukur dampaknya.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pending.map((program) => (
                  <ProgramCard key={program.id} program={program} />
                ))}
              </div>
            )}
          </section>

          {assessed.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-medium text-[#16191D]">
                Sudah dinilai
                <span className="ml-2 rounded-full bg-[#F1F3F4] px-2 py-0.5 text-xs text-[#5B6269]">
                  {assessed.length}
                </span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {assessed.map((program) => (
                  <ProgramCard key={program.id} program={program} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
