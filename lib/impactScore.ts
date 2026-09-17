import type {
  EvidenceType,
  RiskLevel,
  ScorableProgram,
  SustainabilityLevel,
} from "@/lib/types/sdgProgram";

/**
 * Mesin penilaian SARA Youth.
 *
 * Dua keluaran utama:
 *  1. Impact Score (0-100)  -> seberapa besar dampak program.
 *  2. Risk Level            -> seberapa dapat dipercaya klaim dampak tersebut.
 *
 * Keduanya sengaja dipisah. Program bisa mengklaim capaian tinggi tetapi
 * miskin bukti; kombinasi itulah yang menjadi risiko akuntabilitas, dan
 * itu yang membedakan SARA dari dashboard SDGs biasa.
 *
 * Seluruh perhitungan bersifat deterministik dan dapat ditelusuri lewat
 * field `breakdown` pada hasil, agar setiap angka bisa dijelaskan.
 */

// ---------------------------------------------------------------------------
// Konstanta
// ---------------------------------------------------------------------------

/** Bobot komponen Impact Score. Total harus 1. */
export const IMPACT_WEIGHTS = {
  indicatorAchievement: 0.4,
  beneficiaryReach: 0.2,
  mappingQuality: 0.15,
  evidenceCompleteness: 0.15,
  sustainability: 0.1,
} as const;

/** Bobot komponen Risk Score. Total harus 1. */
export const RISK_WEIGHTS = {
  evidenceGap: 0.35,
  dataCompleteness: 0.25,
  mappingPrecision: 0.2,
  achievementPlausibility: 0.2,
} as const;

/** Nilai keberlanjutan per tingkat. */
const SUSTAINABILITY_VALUE: Record<SustainabilityLevel, number> = {
  none: 0,
  planned: 0.4,
  continued: 0.8,
  replicated: 1,
};

/** Jenis bukti yang diharapkan ada untuk sebuah program yang terverifikasi. */
const EXPECTED_EVIDENCE: EvidenceType[] = ["photo", "document", "survey"];

/**
 * Format kode target SDGs yang sah: "4.7", "16.6", "17.a", "12.b".
 * Goal 1-17, target berupa angka 1-19 atau huruf a-c.
 */
const SDG_TARGET_PATTERN = /^(1[0-7]|[1-9])\.([1-9]|1[0-9]|[a-c])$/;

/**
 * Realisasi di atas ambang ini dianggap tidak wajar dan menurunkan
 * kepercayaan terhadap data (bukan menaikkan skor).
 */
const IMPLAUSIBLE_RATIO = 2;

// ---------------------------------------------------------------------------
// Tipe hasil
// ---------------------------------------------------------------------------

export interface ImpactBreakdown {
  /** Rata-rata rasio capaian indikator, 0-1. */
  indicatorAchievement: number;
  /** Rasio penerima manfaat terealisasi, 0-1. */
  beneficiaryReach: number;
  /** Kualitas pemetaan ke target SDGs, 0-1. */
  mappingQuality: number;
  /** Kelengkapan jenis bukti, 0-1. */
  evidenceCompleteness: number;
  /** Tingkat keberlanjutan, 0-1. */
  sustainability: number;
}

export interface RiskBreakdown {
  /** Selisih antara klaim capaian dan bukti yang tersedia, 0-1. */
  evidenceGap: number;
  /** Proporsi data kunci yang belum terisi, 0-1. */
  dataCompleteness: number;
  /** Ketidaktepatan pemetaan target SDGs, 0-1. */
  mappingPrecision: number;
  /** Indikasi capaian yang tidak wajar, 0-1. */
  achievementPlausibility: number;
}

export type ImpactBand =
  | "Perlu Perbaikan"
  | "Berkembang"
  | "Baik"
  | "Sangat Baik";

export interface ScoringResult {
  /** Impact Score akhir, 0-100, dibulatkan ke bilangan bulat. */
  impactScore: number;
  /** Kategori kualitatif dari Impact Score. */
  band: ImpactBand;
  /** Risk Score mentah, 0-100. Makin tinggi makin berisiko. */
  riskScore: number;
  riskLevel: RiskLevel;
  impactBreakdown: ImpactBreakdown;
  riskBreakdown: RiskBreakdown;
  /** Catatan temuan yang memicu risiko, untuk ditampilkan ke pengguna. */
  flags: string[];
}

// ---------------------------------------------------------------------------
// Util
// ---------------------------------------------------------------------------

/** Batasi nilai ke rentang 0-1. */
const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/** Bulatkan ke 3 angka desimal agar breakdown enak dibaca. */
const round3 = (value: number): number => Math.round(value * 1000) / 1000;

/** Periksa apakah sebuah kode target SDGs berformat sah. */
export const isValidSdgTarget = (target: string): boolean =>
  SDG_TARGET_PATTERN.test(target.trim());

// ---------------------------------------------------------------------------
// Komponen Impact Score
// ---------------------------------------------------------------------------

/**
 * Rata-rata rasio `actual / target` dari seluruh indikator, dibatasi maksimal 1.
 * Indikator yang belum diukur (`actual === null`) dihitung sebagai 0, bukan
 * diabaikan, agar program yang belum lengkap tidak diuntungkan.
 */
function scoreIndicatorAchievement(program: ScorableProgram): number {
  const { indicators } = program;
  if (indicators.length === 0) return 0;

  const total = indicators.reduce((sum, indicator) => {
    if (indicator.actual === null || indicator.target <= 0) return sum;
    return sum + clamp01(indicator.actual / indicator.target);
  }, 0);

  return total / indicators.length;
}

/** Rasio penerima manfaat yang benar-benar terjangkau, dibatasi maksimal 1. */
function scoreBeneficiaryReach(program: ScorableProgram): number {
  const { beneficiariesTarget, beneficiariesActual } = program;
  if (beneficiariesActual === null || beneficiariesTarget <= 0) return 0;
  return clamp01(beneficiariesActual / beneficiariesTarget);
}

/**
 * Kualitas pemetaan SDGs.
 * Memilih goal saja belum cukup; program dianggap terpetakan dengan baik
 * bila menyebut target spesifik (mis. "4.7") dan target tersebut konsisten
 * dengan goal yang dipilih.
 *
 * - 0.5 bagian: ada minimal satu target berformat sah.
 * - 0.5 bagian: seluruh target yang dicantumkan berada di bawah goal
 *   utama atau goal pendukung yang dideklarasikan.
 */
function scoreMappingQuality(program: ScorableProgram): number {
  const valid = program.sdgTargets.filter(isValidSdgTarget);
  if (valid.length === 0) return 0;

  const declaredGoals = new Set<number>([
    program.primaryGoal,
    ...program.supportingGoals,
  ]);

  const consistent = valid.filter((target) => {
    const goal = Number(target.split(".")[0]);
    return declaredGoals.has(goal);
  });

  const hasSpecificTarget = 0.5;
  const consistencyRatio = (consistent.length / valid.length) * 0.5;

  return hasSpecificTarget + consistencyRatio;
}

/** Proporsi jenis bukti (foto, dokumen, survei) yang tersedia. */
function scoreEvidenceCompleteness(program: ScorableProgram): number {
  const present = new Set(
    program.evidence
      .filter((item) => item.url.trim().length > 0)
      .map((item) => item.type),
  );
  const covered = EXPECTED_EVIDENCE.filter((type) => present.has(type)).length;
  return covered / EXPECTED_EVIDENCE.length;
}

/** Nilai keberlanjutan program. */
function scoreSustainability(program: ScorableProgram): number {
  return SUSTAINABILITY_VALUE[program.sustainability] ?? 0;
}

// ---------------------------------------------------------------------------
// Komponen Risk Score
// ---------------------------------------------------------------------------

/**
 * Selisih antara besarnya klaim capaian dan kekuatan bukti pendukung.
 * Program yang mengklaim capaian 100% tanpa bukti apa pun menghasilkan
 * nilai 1 (risiko maksimal pada komponen ini).
 */
function riskEvidenceGap(
  indicatorAchievement: number,
  evidenceCompleteness: number,
): number {
  return clamp01(indicatorAchievement - evidenceCompleteness);
}

/** Proporsi data kunci yang belum terisi. */
function riskDataCompleteness(program: ScorableProgram): {
  value: number;
  missing: string[];
} {
  const checks: Array<{ label: string; filled: boolean }> = [
    {
      label: "Realisasi penerima manfaat",
      filled: program.beneficiariesActual !== null,
    },
    { label: "Daftar indikator", filled: program.indicators.length > 0 },
    {
      label: "Realisasi seluruh indikator",
      filled:
        program.indicators.length > 0 &&
        program.indicators.every((indicator) => indicator.actual !== null),
    },
    { label: "Bukti pendukung", filled: program.evidence.length > 0 },
    { label: "Target SDGs spesifik", filled: program.sdgTargets.length > 0 },
  ];

  const missing = checks.filter((check) => !check.filled).map((c) => c.label);
  return { value: missing.length / checks.length, missing };
}

/** Kebalikan dari kualitas pemetaan. */
function riskMappingPrecision(mappingQuality: number): number {
  return clamp01(1 - mappingQuality);
}

/**
 * Deteksi capaian yang tidak wajar.
 * Realisasi jauh melampaui target (>= 2x) biasanya menandakan salah satuan,
 * salah input, atau target yang ditetapkan terlalu rendah. Semua itu
 * menurunkan keandalan data, jadi dihitung sebagai risiko.
 */
function riskAchievementPlausibility(program: ScorableProgram): {
  value: number;
  outliers: string[];
} {
  const measured = program.indicators.filter(
    (indicator) => indicator.actual !== null && indicator.target > 0,
  );

  const outliers = measured
    .filter((indicator) => indicator.actual! / indicator.target >= IMPLAUSIBLE_RATIO)
    .map((indicator) => indicator.name);

  const beneficiaryOutlier =
    program.beneficiariesActual !== null &&
    program.beneficiariesTarget > 0 &&
    program.beneficiariesActual / program.beneficiariesTarget >= IMPLAUSIBLE_RATIO;

  if (beneficiaryOutlier) outliers.push("Jumlah penerima manfaat");

  const denominator = measured.length + (program.beneficiariesTarget > 0 ? 1 : 0);
  if (denominator === 0) return { value: 0, outliers };

  return { value: clamp01(outliers.length / denominator), outliers };
}

// ---------------------------------------------------------------------------
// Fungsi utama
// ---------------------------------------------------------------------------

/** Ubah Impact Score menjadi kategori kualitatif. */
export function toImpactBand(score: number): ImpactBand {
  if (score >= 90) return "Sangat Baik";
  if (score >= 75) return "Baik";
  if (score >= 50) return "Berkembang";
  return "Perlu Perbaikan";
}

/** Ubah Risk Score menjadi tingkat risiko. */
export function toRiskLevel(riskScore: number): RiskLevel {
  if (riskScore >= 50) return "high";
  if (riskScore >= 25) return "medium";
  return "low";
}

const RISK_ORDER: RiskLevel[] = ["low", "medium", "high"];

/** Ambil tingkat risiko tertinggi di antara dua nilai. */
function maxRisk(a: RiskLevel, b: RiskLevel): RiskLevel {
  return RISK_ORDER.indexOf(a) >= RISK_ORDER.indexOf(b) ? a : b;
}

/**
 * Naikkan tingkat risiko bila ada satu komponen yang bermasalah parah.
 *
 * Rata-rata tertimbang bisa menyamarkan masalah serius: program dengan
 * seluruh angka realisasi 10x target masih bisa memperoleh risk score rendah
 * karena komponen lainnya bersih. Padahal justru itu temuan paling penting.
 * Aturan di bawah memastikan masalah semacam itu tidak tenggelam.
 */
function escalateRisk(base: RiskLevel, risk: RiskBreakdown): RiskLevel {
  let level = base;

  // Sebagian besar angka capaian tidak wajar -> integritas data diragukan.
  if (risk.achievementPlausibility >= 0.75) level = maxRisk(level, "high");
  else if (risk.achievementPlausibility >= 0.5) level = maxRisk(level, "medium");

  // Klaim capaian jauh melampaui bukti yang ada.
  if (risk.evidenceGap >= 0.6) level = maxRisk(level, "medium");

  // Klaim besar, bukti lemah, dan data kunci banyak yang kosong.
  if (risk.evidenceGap >= 0.6 && risk.dataCompleteness >= 0.4) {
    level = maxRisk(level, "high");
  }

  return level;
}

/**
 * Hitung Impact Score dan Risk Level sebuah program.
 * Fungsi ini murni: tidak menyentuh Firestore dan tidak punya efek samping,
 * sehingga aman dipanggil di server component, client component, maupun test.
 */
export function calculateImpact(program: ScorableProgram): ScoringResult {
  // --- Impact ---
  const indicatorAchievement = scoreIndicatorAchievement(program);
  const beneficiaryReach = scoreBeneficiaryReach(program);
  const mappingQuality = scoreMappingQuality(program);
  const evidenceCompleteness = scoreEvidenceCompleteness(program);
  const sustainability = scoreSustainability(program);

  const impactRaw =
    indicatorAchievement * IMPACT_WEIGHTS.indicatorAchievement +
    beneficiaryReach * IMPACT_WEIGHTS.beneficiaryReach +
    mappingQuality * IMPACT_WEIGHTS.mappingQuality +
    evidenceCompleteness * IMPACT_WEIGHTS.evidenceCompleteness +
    sustainability * IMPACT_WEIGHTS.sustainability;

  const impactScore = Math.round(clamp01(impactRaw) * 100);

  // --- Risk ---
  const evidenceGap = riskEvidenceGap(indicatorAchievement, evidenceCompleteness);
  const completeness = riskDataCompleteness(program);
  const mappingPrecision = riskMappingPrecision(mappingQuality);
  const plausibility = riskAchievementPlausibility(program);

  const riskRaw =
    evidenceGap * RISK_WEIGHTS.evidenceGap +
    completeness.value * RISK_WEIGHTS.dataCompleteness +
    mappingPrecision * RISK_WEIGHTS.mappingPrecision +
    plausibility.value * RISK_WEIGHTS.achievementPlausibility;

  const riskScore = Math.round(clamp01(riskRaw) * 100);

  const riskBreakdown: RiskBreakdown = {
    evidenceGap: round3(evidenceGap),
    dataCompleteness: round3(completeness.value),
    mappingPrecision: round3(mappingPrecision),
    achievementPlausibility: round3(plausibility.value),
  };

  const riskLevel = escalateRisk(toRiskLevel(riskScore), riskBreakdown);

  // --- Temuan ---
  const flags: string[] = [];

  if (evidenceGap >= 0.4) {
    flags.push(
      "Capaian yang dilaporkan tinggi, tetapi bukti pendukung belum memadai.",
    );
  }
  for (const item of completeness.missing) {
    flags.push(`Belum terisi: ${item.toLowerCase()}.`);
  }
  if (mappingQuality < 0.5) {
    flags.push(
      "Program belum dipetakan ke target SDGs yang spesifik dan konsisten.",
    );
  }
  for (const name of plausibility.outliers) {
    flags.push(
      `Realisasi "${name}" jauh melampaui target. Periksa kembali satuan dan angka yang diinput.`,
    );
  }

  return {
    impactScore,
    band: toImpactBand(impactScore),
    riskScore,
    riskLevel,
    impactBreakdown: {
      indicatorAchievement: round3(indicatorAchievement),
      beneficiaryReach: round3(beneficiaryReach),
      mappingQuality: round3(mappingQuality),
      evidenceCompleteness: round3(evidenceCompleteness),
      sustainability: round3(sustainability),
    },
    riskBreakdown,
    flags,
  };
}

/**
 * Kontribusi setiap komponen terhadap Impact Score akhir, dalam poin (0-100).
 * Dipakai untuk menjelaskan asal angka di UI Impact Score Indicator,
 * misalnya lewat stacked bar atau daftar rincian.
 */
export function explainImpactScore(
  result: ScoringResult,
): Array<{ key: keyof ImpactBreakdown; label: string; points: number; max: number }> {
  const labels: Record<keyof ImpactBreakdown, string> = {
    indicatorAchievement: "Capaian indikator",
    beneficiaryReach: "Jangkauan penerima manfaat",
    mappingQuality: "Kualitas pemetaan SDGs",
    evidenceCompleteness: "Kelengkapan bukti",
    sustainability: "Keberlanjutan",
  };

  return (Object.keys(labels) as Array<keyof ImpactBreakdown>).map((key) => ({
    key,
    label: labels[key],
    points: round3(result.impactBreakdown[key] * IMPACT_WEIGHTS[key] * 100),
    max: IMPACT_WEIGHTS[key] * 100,
  }));
}
