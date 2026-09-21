"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { EvidenceEditor } from "@/components/assessment/EvidenceEditor";
import { ImpactScoreIndicator } from "@/components/assessment/ImpactScoreIndicator";
import { IndicatorEditor } from "@/components/assessment/IndicatorEditor";
import { SdgMappingPanel } from "@/components/assessment/SdgMappingPanel";
import { GoalChip, StatusBadge } from "@/components/shared/Badges";
import { calculateImpact } from "@/lib/impactScore";
import {
  getProgram,
  saveAssessment,
  type AssessmentValues,
} from "@/lib/services/sdgPrograms";
import type {
  ScorableProgram,
  SdgGoal,
  SdgProgram,
  SustainabilityLevel,
} from "@/lib/types/sdgProgram";

const SUSTAINABILITY_OPTIONS: Array<{
  value: SustainabilityLevel;
  label: string;
  description: string;
}> = [
  {
    value: "none",
    label: "Tidak ada tindak lanjut",
    description: "Program selesai dan berhenti di situ.",
  },
  {
    value: "planned",
    label: "Ada rencana lanjutan",
    description: "Sudah direncanakan, belum berjalan.",
  },
  {
    value: "continued",
    label: "Dilanjutkan",
    description: "Organisasi yang sama menjalankan lagi.",
  },
  {
    value: "replicated",
    label: "Direplikasi organisasi lain",
    description: "Organisasi lain mengadopsi program ini.",
  },
];

const inputClass =
  "w-full rounded-lg border border-[var(--sara-border)] bg-[var(--sara-surface)] px-3 py-2 text-sm text-[var(--sara-text-primary)] outline-none transition focus:border-[#12A594] focus:ring-2 focus:ring-[#12A594]/20";

export default function ImpactAssessmentDetailPage() {
  const params = useParams<{ programId: string }>();
  const router = useRouter();
  const programId = params.programId;

  const [program, setProgram] = useState<SdgProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const [values, setValues] = useState<AssessmentValues>({
    supportingGoals: [],
    sdgTargets: [],
    beneficiariesActual: null,
    indicators: [],
    evidence: [],
    sustainability: "none",
  });

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      const found = await getProgram(programId);

      if (!active) return;

      if (!found) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProgram(found);
      setValues({
        supportingGoals: found.supportingGoals,
        sdgTargets: found.sdgTargets,
        beneficiariesActual: found.beneficiariesActual,
        indicators: found.indicators,
        evidence: found.evidence,
        sustainability: found.sustainability,
      });
      setLoading(false);
    }

    void load();
    return () => {
      active = false;
    };
  }, [programId]);

  /**
   * Skor dihitung ulang setiap kali input berubah, memakai fungsi yang sama
   * dengan yang dipakai saat menyimpan. Jadi angka di layar tidak pernah
   * berbeda dari angka yang masuk ke database.
   */
  const result = useMemo(() => {
    const scorable: ScorableProgram = {
      primaryGoal: program?.primaryGoal ?? 1,
      supportingGoals: values.supportingGoals,
      sdgTargets: values.sdgTargets,
      beneficiariesTarget: program?.beneficiariesTarget ?? 0,
      beneficiariesActual: values.beneficiariesActual,
      indicators: values.indicators,
      evidence: values.evidence,
      sustainability: values.sustainability,
    };
    return calculateImpact(scorable);
  }, [program, values]);

  async function handleSave() {
    if (!program) return;
    setSaving(true);
    setSaveError(null);
    try {
      await saveAssessment(
        program.id,
        values,
        program.primaryGoal,
        program.beneficiariesTarget,
      );
      setSavedAt(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    } catch {
      setSaveError(
        "Penilaian gagal disimpan. Periksa koneksi internet, lalu coba lagi.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-[var(--sara-muted-card)]" />
        <div className="h-64 animate-pulse rounded-2xl bg-[var(--sara-muted-card)]" />
      </div>
    );
  }

  if (notFound || !program) {
    return (
      <div className="rounded-2xl border border-[var(--sara-border)] bg-[var(--sara-surface)] px-6 py-14 text-center">
        <h1 className="text-base font-semibold text-[var(--sara-text-primary)]">
          Program tidak ditemukan
        </h1>
        <p className="mt-1 text-sm text-[var(--sara-text-secondary)]">
          Program mungkin sudah dihapus atau tautannya keliru.
        </p>
        <button
          onClick={() => router.push("/sdgs-programs")}
          className="mt-5 rounded-lg bg-[#12A594] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0C8377]"
        >
          Kembali ke daftar program
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/impact-assessment"
            className="text-sm text-[#12A594] transition hover:text-[#0C8377]"
          >
            Kembali ke daftar penilaian
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-[var(--sara-text-primary)]">
            {program.programName}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <GoalChip goal={program.primaryGoal} size="sm" showName />
            <span className="text-sm text-[var(--sara-text-secondary)]">{program.organization}</span>
            <StatusBadge status={program.status} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {savedAt && (
            <span className="text-xs text-[#0C8377]">
              Tersimpan pukul {savedAt}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-[#12A594] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0C8377] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Menyimpan…" : "Simpan penilaian"}
          </button>
        </div>
      </header>

      {saveError && (
        <p className="rounded-lg bg-[#FEE2E2] px-4 py-3 text-sm text-[#B91C1C]">
          {saveError}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <SdgMappingPanel
            primaryGoal={program.primaryGoal}
            supportingGoals={values.supportingGoals}
            sdgTargets={values.sdgTargets}
            onChangeSupportingGoals={(goals: SdgGoal[]) =>
              setValues((prev) => ({ ...prev, supportingGoals: goals }))
            }
            onChangeTargets={(targets: string[]) =>
              setValues((prev) => ({ ...prev, sdgTargets: targets }))
            }
          />

          <section className="rounded-2xl border border-[var(--sara-border)] bg-[var(--sara-surface)] p-6">
            <h2 className="text-base font-semibold text-[var(--sara-text-primary)]">
              Penerima manfaat
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--sara-text-primary)]">
                  Target
                </label>
                <input
                  className={`${inputClass} bg-[var(--sara-muted-card)]`}
                  value={program.beneficiariesTarget}
                  readOnly
                />
                <p className="mt-1 text-xs text-[var(--sara-text-secondary)]">
                  Diambil dari data program. Ubah lewat halaman SDGs Programs.
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--sara-text-primary)]">
                  Realisasi
                </label>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={values.beneficiariesActual ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      beneficiariesActual:
                        e.target.value === "" ? null : Number(e.target.value),
                    }))
                  }
                  placeholder="—"
                />
                <p className="mt-1 text-xs text-[var(--sara-text-secondary)]">
                  Jumlah orang yang benar-benar terjangkau.
                </p>
              </div>
            </div>
          </section>

          <IndicatorEditor
            indicators={values.indicators}
            onChange={(indicators) =>
              setValues((prev) => ({ ...prev, indicators }))
            }
          />

          <EvidenceEditor
            evidence={values.evidence}
            onChange={(evidence) => setValues((prev) => ({ ...prev, evidence }))}
          />

          <section className="rounded-2xl border border-[var(--sara-border)] bg-[var(--sara-surface)] p-6">
            <h2 className="text-base font-semibold text-[var(--sara-text-primary)]">
              Keberlanjutan
            </h2>
            <p className="mt-1 text-sm text-[var(--sara-text-secondary)]">
              Apa yang terjadi pada program ini setelah periode pelaksanaan
              selesai.
            </p>
            <div className="mt-4 space-y-2">
              {SUSTAINABILITY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                    values.sustainability === option.value
                      ? "border-[#12A594] bg-[#E4F6F3]/40"
                      : "border-[var(--sara-border)] hover:border-[var(--sara-border)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="sustainability"
                    checked={values.sustainability === option.value}
                    onChange={() =>
                      setValues((prev) => ({
                        ...prev,
                        sustainability: option.value,
                      }))
                    }
                    className="mt-0.5 h-4 w-4 accent-[#12A594]"
                  />
                  <span>
                    <span className="block text-sm font-medium text-[var(--sara-text-primary)]">
                      {option.label}
                    </span>
                    <span className="block text-xs text-[var(--sara-text-secondary)]">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <ImpactScoreIndicator result={result} />
        </div>
      </div>
    </div>
  );
}
