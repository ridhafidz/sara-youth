import Link from "next/link";

import { GoalChip, RiskBadge, ScoreCell } from "@/components/shared/Badges";
import type { SdgProgram } from "@/lib/types/sdgProgram";

/**
 * Impact Indicator Tracker — bagian daftar pantau risiko.
 * Menyorot program yang butuh tindak lanjut paling mendesak: risiko tinggi
 * dengan klaim skor besar, persis kasus yang selama ini lolos dari
 * pelaporan administratif biasa.
 */
export function RiskWatchlist({ programs }: { programs: SdgProgram[] }) {
  return (
    <section className="rounded-2xl border border-[#ECEEF0] bg-white p-6">
      <h2 className="text-base font-semibold text-[#16191D]">
        Perlu ditindaklanjuti
      </h2>
      <p className="mt-1 text-sm text-[#8A9099]">
        Program berisiko tinggi diurutkan lebih dulu. Skor besar dengan risiko
        tinggi berarti capaian belum didukung bukti yang memadai.
      </p>

      {programs.length === 0 ? (
        <p className="mt-6 py-8 text-center text-sm text-[#8A9099]">
          Tidak ada program berisiko saat ini. Semua klaim capaian sebanding
          dengan buktinya.
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-[#ECEEF0]">
          {programs.map((program) => (
            <li key={program.id} className="flex items-center gap-4 py-3">
              <GoalChip goal={program.primaryGoal} size="sm" />

              <div className="min-w-0 flex-1">
                <Link
                  href={`/impact-assessment/${program.id}`}
                  className="block truncate text-sm font-medium text-[#16191D] transition hover:text-[#12A594]"
                >
                  {program.programName}
                </Link>
                <p className="truncate text-xs text-[#8A9099]">
                  {program.organization}
                </p>
              </div>

              <ScoreCell score={program.impactScore} />
              <RiskBadge risk={program.riskLevel} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
