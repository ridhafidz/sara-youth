"use client";

import { RiskBadge } from "@/components/shared/Badges";
import { explainImpactScore, type ScoringResult } from "@/lib/impactScore";

/** Warna gauge mengikuti kategori skor. */
function scoreColor(score: number): string {
  if (score >= 90) return "#0C8377";
  if (score >= 75) return "#12A594";
  if (score >= 50) return "#F59E0B";
  return "#E5243B";
}

/**
 * Gauge setengah lingkaran.
 * `pathLength={100}` membuat panjang lintasan dinormalisasi ke 100, sehingga
 * strokeDasharray bisa langsung memakai nilai skor tanpa menghitung keliling.
 */
function Gauge({ score }: { score: number }) {
  const color = scoreColor(score);

  return (
    <div className="relative w-full max-w-[220px]">
      <svg viewBox="0 0 200 110" className="w-full" role="img" aria-label={`Impact Score ${score} dari 100`}>
        <path
          d="M 15 100 A 85 85 0 0 1 185 100"
          fill="none"
          stroke="#ECEEF0"
          strokeWidth={16}
          strokeLinecap="round"
        />
        <path
          d="M 15 100 A 85 85 0 0 1 185 100"
          fill="none"
          stroke={color}
          strokeWidth={16}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${score} 100`}
          style={{ transition: "stroke-dasharray 500ms ease, stroke 300ms ease" }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <div
          className="text-4xl font-semibold tabular-nums"
          style={{ color }}
        >
          {score}
        </div>
        <div className="text-xs text-[var(--sara-text-secondary)]">dari 100</div>
      </div>
    </div>
  );
}

/**
 * Impact Score Indicator.
 *
 * Skor besar selalu ditemani rinciannya. Angka tanpa penjelasan asal-usul
 * adalah persis masalah yang ingin diperbaiki program ini, jadi rincian
 * komponen bukan fitur tambahan melainkan bagian dari argumennya.
 */
export function ImpactScoreIndicator({ result }: { result: ScoringResult }) {
  const breakdown = explainImpactScore(result);

  return (
    <section className="rounded-2xl border border-[var(--sara-border)] bg-[var(--sara-surface)] p-6">
      <h2 className="text-base font-semibold text-[var(--sara-text-primary)]">
        Impact Score Indicator
      </h2>
      <p className="mt-1 text-sm text-[var(--sara-text-secondary)]">
        Diperbarui langsung saat data di kiri berubah.
      </p>

      <div className="mt-4 flex flex-col items-center">
        <Gauge score={result.impactScore} />
        <p className="mt-3 text-sm font-medium text-[var(--sara-text-primary)]">{result.band}</p>
      </div>

      <div className="mt-6 space-y-3 border-t border-[var(--sara-border)] pt-5">
        <h3 className="text-sm font-medium text-[var(--sara-text-primary)]">Rincian poin</h3>
        {breakdown.map((item) => (
          <div key={item.key}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-[#5B6269]">{item.label}</span>
              <span className="tabular-nums text-[var(--sara-text-primary)]">
                {item.points.toFixed(1)}
                <span className="text-[var(--sara-text-secondary)]"> / {item.max}</span>
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--sara-muted-card)]">
              <div
                className="h-full rounded-full bg-[#12A594] transition-all duration-500"
                style={{ width: `${(item.points / item.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-[var(--sara-border)] pt-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-[var(--sara-text-primary)]">
            Risiko akuntabilitas
          </h3>
          <RiskBadge risk={result.riskLevel} />
        </div>

        {result.flags.length === 0 ? (
          <p className="mt-3 text-sm text-[#5B6269]">
            Tidak ada temuan. Data capaian sebanding dengan bukti yang tersedia.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {result.flags.map((flag, index) => (
              <li
                key={index}
                className="flex gap-2 rounded-lg bg-[#FEF3C7]/60 px-3 py-2 text-sm text-[#7C4A03]"
              >
                <span aria-hidden="true" className="select-none">
                  •
                </span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 text-xs text-[var(--sara-text-secondary)]">
          Skor tinggi dengan risiko tinggi berarti capaian besar yang belum
          didukung bukti memadai.
        </p>
      </div>
    </section>
  );
}
