import { GoalChip } from "@/components/shared/Badges";
import { calculateImpact, explainImpactScore } from "@/lib/impactScore";
import { SDG_GOALS, findTargetLabel } from "@/lib/sdgGoals";
import type { ScorableProgram, SdgProgram } from "@/lib/types/sdgProgram";

const SUSTAINABILITY_LABEL: Record<SdgProgram["sustainability"], string> = {
  none: "Tidak ada tindak lanjut",
  planned: "Ada rencana lanjutan",
  continued: "Dilanjutkan oleh organisasi yang sama",
  replicated: "Direplikasi oleh organisasi lain",
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * SDGs Impact Report — dokumen siap cetak untuk satu program.
 *
 * Skor dan temuan dihitung ulang di sini lewat `calculateImpact`, bukan
 * dibaca langsung dari field `impactScore`/`riskLevel` yang tersimpan.
 * Dengan begitu laporan selalu konsisten dengan Impact Score Indicator di
 * halaman Assessment, walau field breakdown itu sendiri tidak disimpan ke
 * Firestore.
 */
export function ImpactReportDocument({ program }: { program: SdgProgram }) {
  const scorable: ScorableProgram = {
    primaryGoal: program.primaryGoal,
    supportingGoals: program.supportingGoals,
    sdgTargets: program.sdgTargets,
    beneficiariesTarget: program.beneficiariesTarget,
    beneficiariesActual: program.beneficiariesActual,
    indicators: program.indicators,
    evidence: program.evidence,
    sustainability: program.sustainability,
  };

  const result = calculateImpact(scorable);
  const breakdown = explainImpactScore(result);
  const allGoals = [program.primaryGoal, ...program.supportingGoals];

  return (
    <article className="mx-auto max-w-3xl rounded-2xl border border-[var(--sara-border)] bg-[var(--sara-surface)] p-8 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
      {/* Kop laporan */}
      <header className="border-b-2 border-[#12A594] pb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#12A594]">
          SARA Youth — SDGs Impact Report
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--sara-text-primary)]">
          {program.programName}
        </h1>
        <p className="mt-1 text-sm text-[#5B6269]">{program.organization}</p>
      </header>

      {/* Ringkasan skor */}
      <section className="mt-6 grid grid-cols-3 gap-4 rounded-xl bg-[var(--sara-muted-card)] p-5 print:bg-transparent print:border print:border-[var(--sara-border)]">
        <div>
          <p className="text-xs font-medium text-[var(--sara-text-secondary)]">Impact Score</p>
          <p className="mt-1 text-3xl font-semibold text-[#12A594]">
            {result.impactScore}
          </p>
          <p className="text-xs text-[#5B6269]">{result.band}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-[var(--sara-text-secondary)]">
            Tingkat risiko akuntabilitas
          </p>
          <p className="mt-1 text-lg font-semibold capitalize text-[var(--sara-text-primary)]">
            {result.riskLevel === "low"
              ? "Rendah"
              : result.riskLevel === "medium"
                ? "Sedang"
                : "Tinggi"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-[var(--sara-text-secondary)]">Periode</p>
          <p className="mt-1 text-sm text-[var(--sara-text-primary)]">
            {formatDate(program.period.start.toDate())}
            {" – "}
            {formatDate(program.period.end.toDate())}
          </p>
        </div>
      </section>

      {/* Info program */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-[var(--sara-text-primary)]">
          Ringkasan Program
        </h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex gap-3">
            <dt className="w-40 shrink-0 text-[var(--sara-text-secondary)]">Tujuan</dt>
            <dd className="text-[var(--sara-text-primary)]">{program.objective}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-40 shrink-0 text-[var(--sara-text-secondary)]">Kelompok sasaran</dt>
            <dd className="text-[var(--sara-text-primary)]">
              {program.targetAudience || "—"}
            </dd>
          </div>
        </dl>
      </section>

      {/* Pemetaan SDGs */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-[var(--sara-text-primary)]">
          Pemetaan Tujuan SDGs
        </h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {allGoals.map((goal) => (
            <GoalChip key={goal} goal={goal} size="sm" showName />
          ))}
        </div>

        {program.sdgTargets.length > 0 ? (
          <ul className="mt-3 space-y-1 text-sm text-[#5B6269]">
            {program.sdgTargets.map((code) => (
              <li key={code}>
                <span className="font-medium text-[var(--sara-text-primary)]">{code}</span>{" "}
                {findTargetLabel(code) ?? "Target SDGs"}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[var(--sara-text-secondary)]">
            Belum dipetakan ke target SDGs spesifik.
          </p>
        )}
      </section>

      {/* Penerima manfaat */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-[var(--sara-text-primary)]">
          Jangkauan Penerima Manfaat
        </h2>
        <p className="mt-2 text-sm text-[var(--sara-text-primary)]">
          {program.beneficiariesActual ?? "belum diukur"} dari target{" "}
          {program.beneficiariesTarget} orang
          {program.beneficiariesActual !== null &&
            ` (${Math.round(
              (program.beneficiariesActual / program.beneficiariesTarget) * 100,
            )}%)`}
        </p>
      </section>

      {/* Indikator */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-[var(--sara-text-primary)]">
          Capaian Indikator
        </h2>
        {program.indicators.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--sara-text-secondary)]">Belum ada indikator.</p>
        ) : (
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--sara-border)] text-xs text-[var(--sara-text-secondary)]">
                <th className="py-2 font-medium">Indikator</th>
                <th className="py-2 font-medium">Target</th>
                <th className="py-2 font-medium">Realisasi</th>
                <th className="py-2 text-right font-medium">Capaian</th>
              </tr>
            </thead>
            <tbody>
              {program.indicators.map((indicator, index) => {
                const ratio =
                  indicator.actual === null || indicator.target <= 0
                    ? null
                    : indicator.actual / indicator.target;
                return (
                  <tr key={index} className="border-b border-[var(--sara-border)] last:border-0">
                    <td className="py-2 text-[var(--sara-text-primary)]">{indicator.name}</td>
                    <td className="py-2 text-[#5B6269]">
                      {indicator.target} {indicator.unit}
                    </td>
                    <td className="py-2 text-[#5B6269]">
                      {indicator.actual === null
                        ? "—"
                        : `${indicator.actual} ${indicator.unit}`}
                    </td>
                    <td className="py-2 text-right font-medium text-[var(--sara-text-primary)]">
                      {ratio === null ? "—" : `${Math.round(ratio * 100)}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* Rincian skor */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-[var(--sara-text-primary)]">
          Rincian Impact Score
        </h2>
        <table className="mt-3 w-full text-left text-sm">
          <tbody>
            {breakdown.map((item) => (
              <tr key={item.key} className="border-b border-[var(--sara-border)] last:border-0">
                <td className="py-2 text-[#5B6269]">{item.label}</td>
                <td className="py-2 text-right font-medium text-[var(--sara-text-primary)]">
                  {item.points.toFixed(1)} / {item.max}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Bukti */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-[var(--sara-text-primary)]">
          Bukti Pendukung
        </h2>
        {program.evidence.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--sara-text-secondary)]">
            Belum ada bukti yang dilampirkan.
          </p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {program.evidence.map((item, index) => (
              <li key={index} className="text-[var(--sara-text-primary)]">
                <span className="capitalize text-[var(--sara-text-secondary)]">
                  {item.type === "photo"
                    ? "Foto"
                    : item.type === "document"
                      ? "Dokumen"
                      : "Survei"}
                  :{" "}
                </span>
                <span className="break-all">{item.url}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Keberlanjutan */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-[var(--sara-text-primary)]">Keberlanjutan</h2>
        <p className="mt-2 text-sm text-[var(--sara-text-primary)]">
          {SUSTAINABILITY_LABEL[program.sustainability]}
        </p>
      </section>

      {/* Temuan dan catatan evaluasi */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-[var(--sara-text-primary)]">
          Temuan dan Catatan Evaluasi
        </h2>
        {result.flags.length === 0 ? (
          <p className="mt-2 text-sm text-[#5B6269]">
            Tidak ada temuan. Capaian yang dilaporkan sebanding dengan bukti
            yang tersedia.
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5 text-sm text-[#5B6269]">
            {result.flags.map((flag, index) => (
              <li key={index} className="flex gap-2">
                <span aria-hidden="true">•</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="mt-8 border-t border-[var(--sara-border)] pt-4 text-xs text-[var(--sara-text-secondary)]">
        Dokumen ini dibuat otomatis oleh dashboard SARA Youth pada{" "}
        {formatDate(new Date())}. Skor dan temuan dihitung ulang setiap kali
        laporan dibuka, sehingga selalu mencerminkan data terbaru.
      </footer>
    </article>
  );
}
