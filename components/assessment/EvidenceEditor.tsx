"use client";

import type { EvidenceType, ProgramEvidence } from "@/lib/types/sdgProgram";

const inputClass =
  "w-full rounded-lg border border-[#D7DBDF] bg-white px-3 py-2 text-sm text-[#16191D] outline-none transition focus:border-[#12A594] focus:ring-2 focus:ring-[#12A594]/20";

const EVIDENCE_META: Record<
  EvidenceType,
  { label: string; hint: string }
> = {
  photo: {
    label: "Dokumentasi foto",
    hint: "Foto pelaksanaan kegiatan",
  },
  document: {
    label: "Dokumen pendukung",
    hint: "Laporan kegiatan, daftar hadir, atau surat kerja sama",
  },
  survey: {
    label: "Data survei",
    hint: "Hasil pre-test/post-test atau survei kepuasan penerima manfaat",
  },
};

const TYPES: EvidenceType[] = ["photo", "document", "survey"];

/**
 * Editor bukti pendukung.
 *
 * Tiga jenis bukti ditampilkan sebagai slot tetap, bukan daftar bebas, supaya
 * pengguna langsung melihat jenis mana yang belum terisi. Kelengkapan bukti
 * inilah yang dibandingkan dengan klaim capaian untuk menentukan risiko.
 */
export function EvidenceEditor({
  evidence,
  onChange,
}: {
  evidence: ProgramEvidence[];
  onChange: (evidence: ProgramEvidence[]) => void;
}) {
  function valueOf(type: EvidenceType): ProgramEvidence | undefined {
    return evidence.find((item) => item.type === type);
  }

  function update(type: EvidenceType, patch: Partial<ProgramEvidence>) {
    const existing = valueOf(type);

    if (!existing) {
      onChange([...evidence, { type, url: "", caption: "", ...patch }]);
      return;
    }

    const next = evidence.map((item) =>
      item.type === type ? { ...item, ...patch } : item,
    );

    // Entri yang dikosongkan dibuang agar tidak terhitung sebagai bukti ada.
    onChange(
      next.filter((item) => item.url.trim().length > 0 || item.type !== type),
    );
  }

  const filledCount = TYPES.filter(
    (type) => (valueOf(type)?.url ?? "").trim().length > 0,
  ).length;

  return (
    <section className="rounded-2xl border border-[#ECEEF0] bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#16191D]">
            Bukti pendukung
          </h2>
          <p className="mt-1 text-sm text-[#8A9099]">
            Tautan ke file yang sudah diunggah, misalnya Google Drive atau
            Firebase Storage.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[#F1F3F4] px-3 py-1 text-xs font-medium text-[#5B6269]">
          {filledCount} dari 3 terisi
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {TYPES.map((type) => {
          const current = valueOf(type);
          const meta = EVIDENCE_META[type];
          const filled = (current?.url ?? "").trim().length > 0;

          return (
            <div
              key={type}
              className={`rounded-xl border p-4 transition ${
                filled
                  ? "border-[#12A594]/30 bg-[#E4F6F3]/30"
                  : "border-[#ECEEF0] bg-[#FAFBFB]"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-[#16191D]">
                  {meta.label}
                </span>
                {filled && (
                  <span className="text-xs font-medium text-[#0C8377]">
                    Terisi
                  </span>
                )}
              </div>

              <input
                className={inputClass}
                value={current?.url ?? ""}
                onChange={(e) => update(type, { url: e.target.value })}
                placeholder="https://"
              />
              <p className="mt-1.5 text-xs text-[#8A9099]">{meta.hint}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
