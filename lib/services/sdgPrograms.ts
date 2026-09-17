import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { calculateImpact } from "@/lib/impactScore";
import type {
  ProgramEvidence,
  ProgramIndicator,
  ProgramStatus,
  ScorableProgram,
  SdgGoal,
  SdgProgram,
  SustainabilityLevel,
} from "@/lib/types/sdgProgram";

const COLLECTION = "sdg_programs";

/** Nilai yang diisi pengguna pada tahap Input (halaman SDGs Programs). */
export interface ProgramFormValues {
  programName: string;
  organization: string;
  objective: string;
  targetAudience: string;
  primaryGoal: SdgGoal;
  beneficiariesTarget: number;
  /** Format "YYYY-MM-DD" dari input type="date". */
  periodStart: string;
  periodEnd: string;
}

/** Nilai yang diisi pengguna pada tahap Measure (halaman Impact Assessment). */
export interface AssessmentValues {
  supportingGoals: SdgGoal[];
  sdgTargets: string[];
  beneficiariesActual: number | null;
  indicators: ProgramIndicator[];
  evidence: ProgramEvidence[];
  sustainability: SustainabilityLevel;
}

/** Ubah dokumen Firestore menjadi objek SdgProgram yang aman dipakai UI. */
function toProgram(id: string, data: Record<string, unknown>): SdgProgram {
  return {
    id,
    programName: (data.programName as string) ?? "",
    organization: (data.organization as string) ?? "",
    objective: (data.objective as string) ?? "",
    targetAudience: (data.targetAudience as string) ?? "",
    primaryGoal: (data.primaryGoal as SdgGoal) ?? 1,
    supportingGoals: (data.supportingGoals as SdgGoal[]) ?? [],
    sdgTargets: (data.sdgTargets as string[]) ?? [],
    beneficiariesTarget: (data.beneficiariesTarget as number) ?? 0,
    beneficiariesActual: (data.beneficiariesActual as number | null) ?? null,
    indicators: (data.indicators as ProgramIndicator[]) ?? [],
    evidence: (data.evidence as ProgramEvidence[]) ?? [],
    sustainability: (data.sustainability as SustainabilityLevel) ?? "none",
    impactScore: (data.impactScore as number | null) ?? null,
    riskLevel: (data.riskLevel as SdgProgram["riskLevel"]) ?? null,
    scoredAt: (data.scoredAt as Timestamp | null) ?? null,
    period: (data.period as SdgProgram["period"]) ?? {
      start: Timestamp.now(),
      end: Timestamp.now(),
    },
    status: (data.status as ProgramStatus) ?? "draft",
    createdBy: (data.createdBy as string) ?? "",
    createdAt: (data.createdAt as Timestamp) ?? Timestamp.now(),
    updatedAt: (data.updatedAt as Timestamp) ?? Timestamp.now(),
  };
}

/** Ubah string "YYYY-MM-DD" menjadi Timestamp Firestore. */
function toTimestamp(dateString: string): Timestamp {
  return Timestamp.fromDate(new Date(`${dateString}T00:00:00`));
}

/** Ubah Timestamp menjadi string untuk input type="date". */
export function toDateInputValue(timestamp: Timestamp): string {
  return timestamp.toDate().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Operasi baca
// ---------------------------------------------------------------------------

/** Ambil seluruh program, terbaru lebih dulu. */
export async function listPrograms(): Promise<SdgProgram[]> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTION), orderBy("createdAt", "desc")),
  );
  return snapshot.docs.map((d) => toProgram(d.id, d.data()));
}

/** Ambil program milik satu organisasi saja. */
export async function listProgramsByOrganization(
  organization: string,
): Promise<SdgProgram[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION),
      where("organization", "==", organization),
      orderBy("createdAt", "desc"),
    ),
  );
  return snapshot.docs.map((d) => toProgram(d.id, d.data()));
}

/** Ambil satu program. Mengembalikan null bila tidak ditemukan. */
export async function getProgram(id: string): Promise<SdgProgram | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, id));
  if (!snapshot.exists()) return null;
  return toProgram(snapshot.id, snapshot.data());
}

// ---------------------------------------------------------------------------
// Operasi tulis
// ---------------------------------------------------------------------------

/**
 * Buat program baru (tahap Input).
 * Skor sengaja dibiarkan null: program belum diukur, jadi belum punya skor.
 * Menampilkan 0 akan menyesatkan karena tidak bisa dibedakan dari program
 * yang sudah diukur dan memang hasilnya nol.
 */
export async function createProgram(
  values: ProgramFormValues,
  uid: string,
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    programName: values.programName.trim(),
    organization: values.organization.trim(),
    objective: values.objective.trim(),
    targetAudience: values.targetAudience.trim(),
    primaryGoal: values.primaryGoal,
    supportingGoals: [],
    sdgTargets: [],
    beneficiariesTarget: values.beneficiariesTarget,
    beneficiariesActual: null,
    indicators: [],
    evidence: [],
    sustainability: "none" as SustainabilityLevel,
    impactScore: null,
    riskLevel: null,
    scoredAt: null,
    period: {
      start: toTimestamp(values.periodStart),
      end: toTimestamp(values.periodEnd),
    },
    status: "draft" as ProgramStatus,
    createdBy: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Perbarui data dasar program (tahap Input). */
export async function updateProgram(
  id: string,
  values: ProgramFormValues,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    programName: values.programName.trim(),
    organization: values.organization.trim(),
    objective: values.objective.trim(),
    targetAudience: values.targetAudience.trim(),
    primaryGoal: values.primaryGoal,
    beneficiariesTarget: values.beneficiariesTarget,
    period: {
      start: toTimestamp(values.periodStart),
      end: toTimestamp(values.periodEnd),
    },
    updatedAt: serverTimestamp(),
  });
}

/**
 * Simpan hasil penilaian (tahap Measure).
 *
 * Skor dihitung ulang di sini, bukan dikirim dari komponen, supaya nilai yang
 * tersimpan selalu berasal dari satu sumber kebenaran yang sama dengan yang
 * ditampilkan di layar.
 */
export async function saveAssessment(
  id: string,
  values: AssessmentValues,
  primaryGoal: SdgGoal,
  beneficiariesTarget: number,
): Promise<{ impactScore: number; riskLevel: SdgProgram["riskLevel"] }> {
  const scorable: ScorableProgram = {
    primaryGoal,
    supportingGoals: values.supportingGoals,
    sdgTargets: values.sdgTargets,
    beneficiariesTarget,
    beneficiariesActual: values.beneficiariesActual,
    indicators: values.indicators,
    evidence: values.evidence,
    sustainability: values.sustainability,
  };

  const result = calculateImpact(scorable);

  await updateDoc(doc(db, COLLECTION, id), {
    supportingGoals: values.supportingGoals,
    sdgTargets: values.sdgTargets,
    beneficiariesActual: values.beneficiariesActual,
    indicators: values.indicators,
    evidence: values.evidence,
    sustainability: values.sustainability,
    impactScore: result.impactScore,
    riskLevel: result.riskLevel,
    scoredAt: serverTimestamp(),
    status: "measured" as ProgramStatus,
    updatedAt: serverTimestamp(),
  });

  return { impactScore: result.impactScore, riskLevel: result.riskLevel };
}

/** Hapus program. */
export async function deleteProgram(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

/**
 * Tandai program sebagai sudah dilaporkan (tahap Report).
 * Hanya mengubah status; data penilaian tidak disentuh, sehingga bisa
 * dipanggil berkali-kali tanpa risiko menimpa hasil pengukuran.
 */
export async function markReported(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status: "reported" as ProgramStatus,
    updatedAt: serverTimestamp(),
  });
}
