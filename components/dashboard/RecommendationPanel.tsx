"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Info,
  Lightbulb,
} from "lucide-react";

import { calculateImpact } from "@/lib/impactScore";
import type { SdgProgram } from "@/lib/types/sdgProgram";

export function RecommendationPanel({
  programs,
}: {
  programs: SdgProgram[];
}) {
  const summary = useMemo(() => {
    const assessed = programs.filter(
      (program) => program.status !== "draft",
    );

    let totalIssues = 0;
    let highRisk = 0;
    let mediumRisk = 0;
    let lowRisk = 0;

    for (const program of assessed) {
      const result = calculateImpact(program);

      totalIssues += result.flags.length;

      if (result.riskLevel === "high") {
        highRisk++;
      } else if (result.riskLevel === "medium") {
        mediumRisk++;
      } else {
        lowRisk++;
      }
    }

    return {
      assessedCount: assessed.length,
      totalIssues,
      highRisk,
      mediumRisk,
      lowRisk,
    };
  }, [programs]);

  return (
    <section
      aria-labelledby="recommendation-heading"
      className="flex h-full flex-col"
    >
      <div className="mb-4">
        <h2
          id="recommendation-heading"
          className="text-base font-semibold text-[var(--sara-text-primary)]"
        >
          Improvement Recommendations
        </h2>

        <p className="mt-1 text-xs text-[var(--sara-text-secondary)]">
          Saran perbaikan & rencana tindak lanjut (Fase Action)
        </p>
      </div>

      <Link
        href="/improvements"
        className="group flex flex-1 cursor-pointer flex-col rounded-[var(--sara-radius-md)] border border-[var(--sara-border)] bg-[var(--sara-surface)] p-5 transition duration-200 hover:border-[#12A594]/50 hover:shadow-md"
        style={{ boxShadow: "var(--sara-shadow-card)" }}
      >
        {programs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-10 text-center">
            <Info
              size={24}
              className="mb-2 text-[var(--sara-text-secondary)] opacity-50"
            />

            <p className="text-sm text-[var(--sara-text-secondary)]">
              Belum ada program.
            </p>
          </div>
        ) : summary.assessedCount === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-10 text-center">
            <Info
              size={24}
              className="mb-2 text-[var(--sara-text-secondary)] opacity-50"
            />

            <p className="text-sm text-[var(--sara-text-secondary)]">
              Belum ada program yang selesai dinilai.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E4F6F3]">
                <Lightbulb size={20} className="text-[#12A594]" />
              </div>

              <div>
                <p className="text-sm font-semibold text-[var(--sara-text-primary)]">
                  {summary.assessedCount} program telah dievaluasi
                </p>

                <p className="mt-1 text-xs leading-relaxed text-[var(--sara-text-secondary)]">
                  Lihat saran perbaikan dan next plan berdasarkan hasil
                  Impact Assessment.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[var(--sara-muted-card)] p-3">
                <p className="text-xl font-semibold text-[var(--sara-text-primary)]">
                  {summary.totalIssues}
                </p>

                <p className="mt-1 text-[11px] text-[var(--sara-text-secondary)]">
                  Temuan perbaikan
                </p>
              </div>

              <div className="rounded-xl bg-[var(--sara-muted-card)] p-3">
                <p className="text-xl font-semibold text-[#B45309]">
                  {summary.highRisk}
                </p>

                <p className="mt-1 text-[11px] text-[var(--sara-text-secondary)]">
                  Program risiko tinggi
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {summary.highRisk > 0 && (
                <div className="flex items-center gap-2 text-xs text-[var(--sara-text-secondary)]">
                  <AlertTriangle
                    size={14}
                    className="shrink-0 text-[#B45309]"
                  />

                  <span>
                    {summary.highRisk} program membutuhkan perhatian utama.
                  </span>
                </div>
              )}

              {summary.highRisk === 0 &&
                summary.totalIssues === 0 && (
                  <div className="flex items-center gap-2 text-xs text-[#0C8377]">
                    <CheckCircle size={14} />

                    <span>
                      Tidak ada isu utama yang perlu ditindaklanjuti.
                    </span>
                  </div>
                )}
            </div>

            <div className="mt-auto flex items-center justify-end pt-5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#12A594] transition group-hover:gap-2">
                Lihat Improvement
                <ArrowRight size={14} />
              </span>
            </div>
          </>
        )}
      </Link>
    </section>
  );
}