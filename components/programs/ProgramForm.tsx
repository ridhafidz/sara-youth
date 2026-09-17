"use client";

import { useState } from "react";

import { SDG_GOAL_LIST } from "@/lib/sdgGoals";
import type { ProgramFormValues } from "@/lib/services/sdgPrograms";
import type { SdgGoal } from "@/lib/types/sdgProgram";

const EMPTY: ProgramFormValues = {
  programName: "",
  organization: "",
  objective: "",
  targetAudience: "",
  primaryGoal: 4,
  beneficiariesTarget: 0,
  periodStart: "",
  periodEnd: "",
};

const inputClass =
  "w-full rounded-lg border border-[#D7DBDF] bg-white px-3 py-2 text-sm text-[#16191D] outline-none transition focus:border-[#12A594] focus:ring-2 focus:ring-[#12A594]/20";

const labelClass = "mb-1.5 block text-sm font-medium text-[#16191D]";

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-[#B91C1C]">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-[#8A9099]">{hint}</p>
      ) : null}
    </div>
  );
}

/**
 * Form tahap Input.
 *
 * Yang ditanyakan di sini hanya identitas program dan goal utama. Pemetaan
 * target SDGs, indikator, dan bukti sengaja ditunda ke halaman Impact
 * Assessment agar alur Input -> Measure tetap terasa sebagai dua tahap
 * berbeda, sesuai framework SARA Youth.
 */
export function ProgramForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Simpan program",
}: {
  initialValues?: ProgramFormValues;
  onSubmit: (values: ProgramFormValues) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<ProgramFormValues>(initialValues ?? EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function set<K extends keyof ProgramFormValues>(
    key: K,
    value: ProgramFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};

    if (!values.programName.trim()) {
      next.programName = "Isi nama program.";
    }
    if (!values.organization.trim()) {
      next.organization = "Isi organisasi pelaksana.";
    }
    if (!values.objective.trim()) {
      next.objective = "Jelaskan tujuan program dalam satu kalimat.";
    }
    if (values.beneficiariesTarget <= 0) {
      next.beneficiariesTarget = "Target penerima manfaat harus lebih dari 0.";
    }
    if (!values.periodStart || !values.periodEnd) {
      next.periodEnd = "Isi tanggal mulai dan selesai.";
    } else if (values.periodEnd < values.periodStart) {
      next.periodEnd = "Tanggal selesai tidak boleh lebih awal dari tanggal mulai.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    setSaveError(null);
    try {
      await onSubmit(values);
    } catch {
      setSaveError(
        "Program gagal disimpan. Periksa koneksi internet, lalu coba lagi.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <Field label="Nama program" error={errors.programName}>
        <input
          className={inputClass}
          value={values.programName}
          onChange={(e) => set("programName", e.target.value)}
          placeholder="Sekolah Literasi Keuangan untuk Pelajar"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Organisasi pelaksana" error={errors.organization}>
          <input
            className={inputClass}
            value={values.organization}
            onChange={(e) => set("organization", e.target.value)}
            placeholder="BEM Fakultas Vokasi"
          />
        </Field>

        <Field
          label="Goal SDGs utama"
          hint="Goal yang paling dominan. Goal pendukung diisi saat penilaian."
        >
          <select
            className={inputClass}
            value={values.primaryGoal}
            onChange={(e) => set("primaryGoal", Number(e.target.value) as SdgGoal)}
          >
            {SDG_GOAL_LIST.map((goal) => (
              <option key={goal.goal} value={goal.goal}>
                {goal.goal}. {goal.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Tujuan program" error={errors.objective}>
        <textarea
          className={`${inputClass} min-h-[80px] resize-y`}
          value={values.objective}
          onChange={(e) => set("objective", e.target.value)}
          placeholder="Meningkatkan pemahaman pengelolaan keuangan pribadi pada pelajar SMA."
        />
      </Field>

      <Field
        label="Kelompok sasaran"
        hint="Siapa yang menerima manfaat langsung dari program ini."
      >
        <input
          className={inputClass}
          value={values.targetAudience}
          onChange={(e) => set("targetAudience", e.target.value)}
          placeholder="Pelajar SMA di Kelurahan Mulyorejo"
        />
      </Field>

      <Field
        label="Target penerima manfaat"
        hint="Jumlah orang yang direncanakan terjangkau."
        error={errors.beneficiariesTarget}
      >
        <input
          type="number"
          min={0}
          className={inputClass}
          value={values.beneficiariesTarget || ""}
          onChange={(e) => set("beneficiariesTarget", Number(e.target.value))}
          placeholder="100"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Tanggal mulai">
          <input
            type="date"
            className={inputClass}
            value={values.periodStart}
            onChange={(e) => set("periodStart", e.target.value)}
          />
        </Field>
        <Field label="Tanggal selesai" error={errors.periodEnd}>
          <input
            type="date"
            className={inputClass}
            value={values.periodEnd}
            onChange={(e) => set("periodEnd", e.target.value)}
          />
        </Field>
      </div>

      {saveError && (
        <p className="rounded-lg bg-[#FEE2E2] px-3 py-2 text-sm text-[#B91C1C]">
          {saveError}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-[#ECEEF0] pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-[#5B6269] transition hover:bg-[#F1F3F4]"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="rounded-lg bg-[#12A594] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0C8377] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Menyimpan…" : submitLabel}
        </button>
      </div>
    </div>
  );
}
