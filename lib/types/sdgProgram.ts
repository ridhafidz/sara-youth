import type { Timestamp } from "firebase/firestore";

/**
 * Tipe data untuk collection `sdg_programs` di Firestore.
 * Ini adalah sumber data utama untuk seluruh framework SARA Youth
 * (Input -> Measure -> Report -> Action).
 */

/** Nomor tujuan SDGs, 1-17. */
export type SdgGoal =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17;

/** Status program dalam siklus SARA Youth. */
export type ProgramStatus =
  | "draft"     // Input: data dasar terisi, belum diukur
  | "measured"  // Measure: indikator sudah dinilai, impact score tersedia
  | "reported"; // Report: laporan dampak sudah disusun / dipublikasikan

/** Tingkat keberlanjutan program setelah periode pelaksanaan selesai. */
export type SustainabilityLevel =
  | "none"       // tidak ada tindak lanjut
  | "planned"    // ada rencana lanjutan, belum berjalan
  | "continued"  // dilanjutkan oleh organisasi yang sama
  | "replicated";// direplikasi organisasi lain

/** Jenis bukti pendukung capaian program. */
export type EvidenceType = "photo" | "document" | "survey";

/** Tingkat risiko akuntabilitas program. */
export type RiskLevel = "low" | "medium" | "high";

/** Satu indikator keberhasilan beserta target dan realisasinya. */
export interface ProgramIndicator {
  /** Nama indikator, mis. "Peserta lulus post-test". */
  name: string;
  /** Satuan ukur, mis. "orang", "kg", "%". */
  unit: string;
  /** Nilai target yang direncanakan. Harus > 0. */
  target: number;
  /** Nilai realisasi. `null` berarti belum diukur. */
  actual: number | null;
  /** Nilai awal sebelum program berjalan (opsional, untuk indikator perubahan). */
  baseline?: number | null;
}

/** Bukti pendukung yang diunggah untuk memverifikasi capaian. */
export interface ProgramEvidence {
  type: EvidenceType;
  /** URL file di Firebase Storage atau tautan eksternal. */
  url: string;
  /** Keterangan singkat isi bukti. */
  caption?: string;
}

/** Periode pelaksanaan program. */
export interface ProgramPeriod {
  start: Timestamp;
  end: Timestamp;
}

/** Dokumen lengkap pada collection `sdg_programs`. */
export interface SdgProgram {
  /** Document ID Firestore (tidak disimpan di dalam dokumen). */
  id: string;

  // --- Tahap INPUT ---
  programName: string;
  /** Organisasi pelaksana, mis. "BEM Fakultas Vokasi". */
  organization: string;
  /** Tujuan program dalam satu kalimat. */
  objective: string;
  /** Kelompok sasaran, mis. "Siswa SMA di Kelurahan Mulyorejo". */
  targetAudience: string;

  // --- Tahap MEASURE: pemetaan ---
  /** Goal utama, dipakai untuk pewarnaan dan pengelompokan di chart. */
  primaryGoal: SdgGoal;
  /** Goal pendukung. Tidak boleh memuat `primaryGoal`. */
  supportingGoals: SdgGoal[];
  /** Kode target SDGs spesifik, mis. ["4.7", "16.6"]. */
  sdgTargets: string[];

  // --- Tahap MEASURE: capaian ---
  beneficiariesTarget: number;
  beneficiariesActual: number | null;
  indicators: ProgramIndicator[];
  evidence: ProgramEvidence[];
  sustainability: SustainabilityLevel;

  // --- Hasil perhitungan (diisi oleh lib/impactScore.ts) ---
  impactScore: number | null;
  riskLevel: RiskLevel | null;
  /** Kapan skor terakhir dihitung ulang. */
  scoredAt: Timestamp | null;

  // --- Metadata ---
  period: ProgramPeriod;
  status: ProgramStatus;
  /** UID pembuat dari Firebase Auth. */
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Bentuk data yang dibutuhkan mesin penilaian.
 * Sengaja dipisah dari `SdgProgram` agar fungsi perhitungan bisa diuji
 * tanpa perlu Firestore Timestamp.
 */
export type ScorableProgram = Pick<
  SdgProgram,
  | "primaryGoal"
  | "supportingGoals"
  | "sdgTargets"
  | "beneficiariesTarget"
  | "beneficiariesActual"
  | "indicators"
  | "evidence"
  | "sustainability"
>;

/** Payload untuk membuat program baru (tahap Input). */
export type NewSdgProgram = Pick<
  SdgProgram,
  | "programName"
  | "organization"
  | "objective"
  | "targetAudience"
  | "primaryGoal"
  | "supportingGoals"
  | "sdgTargets"
  | "beneficiariesTarget"
>;
