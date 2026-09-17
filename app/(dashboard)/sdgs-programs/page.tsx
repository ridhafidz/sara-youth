"use client";

import { useCallback, useEffect, useState } from "react";

import { ProgramForm } from "@/components/programs/ProgramForm";
import { ProgramTable } from "@/components/programs/ProgramTable";
import { EmptyState } from "@/components/shared/Badges";
import {
  createProgram,
  deleteProgram,
  listPrograms,
  toDateInputValue,
  updateProgram,
  type ProgramFormValues,
} from "@/lib/services/sdgPrograms";
import { useAuthUid } from "@/lib/useAuthUid";
import type { SdgProgram } from "@/lib/types/sdgProgram";

/** Ubah dokumen program menjadi nilai awal form saat mengedit. */
function toFormValues(program: SdgProgram): ProgramFormValues {
  return {
    programName: program.programName,
    organization: program.organization,
    objective: program.objective,
    targetAudience: program.targetAudience,
    primaryGoal: program.primaryGoal,
    beneficiariesTarget: program.beneficiariesTarget,
    periodStart: toDateInputValue(program.period.start),
    periodEnd: toDateInputValue(program.period.end),
  };
}

export default function SdgsProgramsPage() {
  const { uid, loading: authLoading } = useAuthUid();

  const [programs, setPrograms] = useState<SdgProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<SdgProgram | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setPrograms(await listPrograms());
    } catch {
      setLoadError(
        "Data program tidak bisa dimuat. Periksa koneksi dan konfigurasi Firebase, lalu muat ulang halaman.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleSubmit(values: ProgramFormValues) {
    if (editing) {
      await updateProgram(editing.id, values);
    } else {
      if (!uid) throw new Error("Belum terautentikasi");
      await createProgram(values, uid);
    }
    setFormOpen(false);
    setEditing(null);
    await refresh();
  }

  async function handleDelete(program: SdgProgram) {
    const confirmed = window.confirm(
      `Hapus "${program.programName}"? Data penilaian dampaknya ikut terhapus dan tidak bisa dikembalikan.`,
    );
    if (!confirmed) return;
    await deleteProgram(program.id);
    await refresh();
  }

  const showForm = formOpen || editing !== null;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#16191D]">SDGs Programs</h1>
          <p className="mt-1 text-sm text-[#8A9099]">
            Daftar program mahasiswa yang akan diukur dampaknya. Tahap Input
            pada framework SARA Youth.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setFormOpen(true)}
            disabled={!uid && !authLoading}
            className="rounded-lg bg-[#12A594] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0C8377] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Tambah program
          </button>
        )}
      </header>

      {!authLoading && !uid && (
        <p className="rounded-lg bg-[#FEF3C7] px-4 py-3 text-sm text-[#B45309]">
          Belum masuk sebagai pengguna, jadi program baru belum bisa disimpan.
          Aktifkan Anonymous sign-in untuk pengembangan, atau selesaikan halaman
          login pada Langkah 7.
        </p>
      )}

      {showForm && (
        <section className="rounded-2xl border border-[#ECEEF0] bg-white p-6">
          <h2 className="mb-5 text-base font-semibold text-[#16191D]">
            {editing ? "Ubah program" : "Program baru"}
          </h2>
          <ProgramForm
            initialValues={editing ? toFormValues(editing) : undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setFormOpen(false);
              setEditing(null);
            }}
            submitLabel={editing ? "Simpan perubahan" : "Simpan program"}
          />
        </section>
      )}

      {loadError && (
        <p className="rounded-lg bg-[#FEE2E2] px-4 py-3 text-sm text-[#B91C1C]">
          {loadError}
        </p>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[#ECEEF0] bg-white p-6">
          <div className="space-y-3">
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                className="h-12 animate-pulse rounded-lg bg-[#F1F3F4]"
              />
            ))}
          </div>
        </div>
      ) : programs.length === 0 ? (
        <EmptyState
          title="Belum ada program terdaftar"
          description="Mulai dengan menambahkan satu program organisasi, lalu ukur dampaknya di halaman Impact Assessment."
          action={
            <button
              onClick={() => setFormOpen(true)}
              className="rounded-lg bg-[#12A594] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0C8377]"
            >
              Tambah program
            </button>
          }
        />
      ) : (
        <ProgramTable
          programs={programs}
          onEdit={(program) => {
            setEditing(program);
            setFormOpen(false);
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
