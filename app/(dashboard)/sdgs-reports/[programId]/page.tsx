"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ImpactReportDocument } from "@/components/reports/ImpactReportDocument";
import { getProgram, markReported } from "@/lib/services/sdgPrograms";
import type { SdgProgram } from "@/lib/types/sdgProgram";

export default function SdgsReportDetailPage() {
  const params = useParams<{ programId: string }>();
  const router = useRouter();
  const programId = params.programId;

  const [program, setProgram] = useState<SdgProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const found = await getProgram(programId);
      if (!active) return;

      if (!found) {
        setNotFound(true);
      } else {
        setProgram(found);
      }
      setLoading(false);
    }

    void load();
    return () => {
      active = false;
    };
  }, [programId]);

  async function handlePublish() {
    if (!program) return;
    setPublishing(true);
    setPublishError(null);
    try {
      await markReported(program.id);
      setProgram({ ...program, status: "reported" });
    } catch {
      setPublishError(
        "Status gagal diperbarui. Periksa koneksi internet, lalu coba lagi.",
      );
    } finally {
      setPublishing(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-[#F1F3F4]" />
        <div className="mx-auto h-[600px] max-w-3xl animate-pulse rounded-2xl bg-[#F1F3F4]" />
      </div>
    );
  }

  if (notFound || !program) {
    return (
      <div className="rounded-2xl border border-[#ECEEF0] bg-white px-6 py-14 text-center">
        <h1 className="text-base font-semibold text-[#16191D]">
          Program tidak ditemukan
        </h1>
        <button
          onClick={() => router.push("/sdgs-reports")}
          className="mt-5 rounded-lg bg-[#12A594] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0C8377]"
        >
          Kembali ke daftar laporan
        </button>
      </div>
    );
  }

  if (program.status === "draft") {
    return (
      <div className="rounded-2xl border border-[#ECEEF0] bg-white px-6 py-14 text-center">
        <h1 className="text-base font-semibold text-[#16191D]">
          Program ini belum diukur
        </h1>
        <p className="mx-auto mt-1 max-w-sm text-sm text-[#8A9099]">
          Laporan dampak baru bisa disusun setelah indikator dan bukti
          program dinilai di halaman Impact Assessment.
        </p>
        <Link
          href={`/impact-assessment/${program.id}`}
          className="mt-5 inline-block rounded-lg bg-[#12A594] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0C8377]"
        >
          Ukur dampak sekarang
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar: disembunyikan saat dicetak agar tidak ikut tercetak. */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href="/sdgs-reports"
          className="text-sm text-[#12A594] transition hover:text-[#0C8377]"
        >
          Kembali ke daftar laporan
        </Link>

        <div className="flex items-center gap-3">
          {publishError && (
            <span className="text-xs text-[#B91C1C]">{publishError}</span>
          )}
          {program.status !== "reported" && (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="rounded-lg border border-[#12A594] px-4 py-2 text-sm font-medium text-[#0C8377] transition hover:bg-[#E4F6F3] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {publishing ? "Menyimpan…" : "Tandai sudah dilaporkan"}
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-[#12A594] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0C8377]"
          >
            Cetak / Simpan sebagai PDF
          </button>
        </div>
      </div>

      <ImpactReportDocument program={program} />
    </div>
  );
}
