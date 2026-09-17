"use client";

import { useMemo } from "react";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

import { calculateImpact } from "@/lib/impactScore";
import type { SdgProgram } from "@/lib/types/sdgProgram";

interface Recommendation {
  programId: string;
  programName: string;
  organization: string;
  flag: string;
}

export function RecommendationPanel({ programs }: { programs: SdgProgram[] }) {
  const recommendations = useMemo(() => {
    const recs: Recommendation[] = [];
    const assessed = programs.filter((p) => p.status !== "draft");

    for (const program of assessed) {
      // Recalculate to get flags (pure function, fast)
      const result = calculateImpact(program);
      
      for (const flag of result.flags) {
        recs.push({
          programId: program.id,
          programName: program.programName,
          organization: program.organization,
          flag,
        });
      }
    }
    
    // Sort by programName to group recommendations slightly, or limit to 5-10
    return recs.slice(0, 8);
  }, [programs]);

  return (
    <section aria-labelledby="recommendation-heading" className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2
            id="recommendation-heading"
            className="text-base font-semibold text-[var(--sara-text-primary)]"
          >
            Improvement Recommendations
          </h2>
          <p className="mt-1 text-xs text-[var(--sara-text-secondary)]">
            Saran otomatis berbasis rule (Fase Action)
          </p>
        </div>
      </div>

      <div
        className="rounded-[var(--sara-radius-md)] bg-[var(--sara-surface)] p-5 border border-[var(--sara-border)] flex-1 overflow-y-auto"
        style={{ boxShadow: "var(--sara-shadow-card)" }}
      >
        {programs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-[var(--sara-text-secondary)] py-10">
            <Info size={24} className="mb-2 opacity-50" />
            <p>Belum ada program yang dinilai.</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-[var(--sara-text-secondary)] py-10">
            <CheckCircle size={24} className="mb-2 text-[#12A594] opacity-80" />
            <p>Semua program terlihat baik. Tidak ada isu kritis.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3 items-start">
                <AlertTriangle
                  size={16}
                  className="mt-0.5 shrink-0 text-[#B45309]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--sara-text-primary)] leading-snug">
                    {rec.flag}
                  </p>
                  <p className="mt-1 text-xs text-[var(--sara-text-secondary)] truncate">
                    Program: <span className="font-medium text-[#12A594]">{rec.programName}</span> ({rec.organization})
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
