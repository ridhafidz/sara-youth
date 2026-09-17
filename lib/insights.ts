import { ALL_GOALS, SDG_GOALS } from "@/lib/sdgGoals";
import type { RiskLevel, SdgGoal, SdgProgram } from "@/lib/types/sdgProgram";

/**
 * Fungsi agregasi murni untuk halaman Impact Insights.
 *
 * Semua fungsi di sini hanya menerima `SdgProgram[]` dan mengembalikan data
 * turunan, tanpa menyentuh Firestore. Ini membuatnya mudah diuji dan bisa
 * dipakai ulang di halaman dashboard maupun Impact Insights tanpa duplikasi
 * logika agregasi.
 */

// ---------------------------------------------------------------------------
// Distribusi per goal
// ---------------------------------------------------------------------------

export interface GoalDistributionPoint {
  goal: SdgGoal;
  shortName: string;
  color: string;
  /** Jumlah program dengan goal ini sebagai goal utama. */
  programCount: number;
  /** Rata-rata Impact Score dari program yang sudah diukur. Null bila belum ada. */
  averageScore: number | null;
  highRiskCount: number;
}

/**
 * Kelompokkan program berdasarkan goal utama.
 * Seluruh 17 goal selalu muncul di hasil, termasuk yang belum punya program,
 * supaya chart tidak "meloncat" saat goal tertentu kebetulan kosong.
 */
export function buildGoalDistribution(
  programs: SdgProgram[],
): GoalDistributionPoint[] {
  return ALL_GOALS.map((goal) => {
    const inGoal = programs.filter((p) => p.primaryGoal === goal);
    const measured = inGoal.filter((p) => p.impactScore !== null);

    const averageScore =
      measured.length === 0
        ? null
        : Math.round(
            measured.reduce((sum, p) => sum + (p.impactScore ?? 0), 0) /
              measured.length,
          );

    return {
      goal,
      shortName: SDG_GOALS[goal].shortName,
      color: SDG_GOALS[goal].color,
      programCount: inGoal.length,
      averageScore,
      highRiskCount: inGoal.filter((p) => p.riskLevel === "high").length,
    };
  });
}

// ---------------------------------------------------------------------------
// Tren skor dari waktu ke waktu
// ---------------------------------------------------------------------------

export interface TrendPoint {
  /** Kunci urut, format "YYYY-MM". */
  monthKey: string;
  /** Label tampilan, mis. "Jun 2026". */
  monthLabel: string;
  averageScore: number;
  programCount: number;
}

/**
 * Rata-rata Impact Score per bulan, berdasarkan kapan program terakhir dinilai
 * (`scoredAt`), bukan kapan dibuat. Program yang belum pernah dinilai tidak
 * ikut dihitung karena belum punya tanggal penilaian.
 */
export function buildScoreTrend(programs: SdgProgram[]): TrendPoint[] {
  const measured = programs.filter(
    (p) => p.impactScore !== null && p.scoredAt !== null,
  );

  const buckets = new Map<string, { total: number; count: number; date: Date }>();

  for (const program of measured) {
    const date = program.scoredAt!.toDate();
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const bucket = buckets.get(monthKey) ?? { total: 0, count: 0, date };
    bucket.total += program.impactScore!;
    bucket.count += 1;
    buckets.set(monthKey, bucket);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, bucket]) => ({
      monthKey,
      monthLabel: bucket.date.toLocaleDateString("id-ID", {
        month: "short",
        year: "numeric",
      }),
      averageScore: Math.round(bucket.total / bucket.count),
      programCount: bucket.count,
    }));
}

// ---------------------------------------------------------------------------
// Daftar pantau risiko
// ---------------------------------------------------------------------------

const RISK_ORDER: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2 };

/**
 * Program yang paling perlu diperhatikan: risiko tertinggi dulu, lalu di
 * antara risiko yang sama, skor tertinggi dulu — karena skor tinggi dengan
 * risiko tinggi (klaim besar, bukti lemah) justru yang paling mendesak
 * ditindaklanjuti, bukan yang skornya rendah.
 */
export function buildRiskWatchlist(
  programs: SdgProgram[],
  limit = 5,
): SdgProgram[] {
  return programs
    .filter((p): p is SdgProgram & { riskLevel: RiskLevel } => p.riskLevel !== null)
    .sort((a, b) => {
      const riskDiff = RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel];
      if (riskDiff !== 0) return riskDiff;
      return (b.impactScore ?? 0) - (a.impactScore ?? 0);
    })
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Ringkasan KPI
// ---------------------------------------------------------------------------

export interface SummaryStats {
  totalPrograms: number;
  measuredPrograms: number;
  averageScore: number | null;
  highRiskCount: number;
  goalsCovered: number;
}

export function buildSummaryStats(programs: SdgProgram[]): SummaryStats {
  const measured = programs.filter((p) => p.impactScore !== null);

  const averageScore =
    measured.length === 0
      ? null
      : Math.round(
          measured.reduce((sum, p) => sum + (p.impactScore ?? 0), 0) /
            measured.length,
        );

  return {
    totalPrograms: programs.length,
    measuredPrograms: measured.length,
    averageScore,
    highRiskCount: programs.filter((p) => p.riskLevel === "high").length,
    goalsCovered: new Set(programs.map((p) => p.primaryGoal)).size,
  };
}
