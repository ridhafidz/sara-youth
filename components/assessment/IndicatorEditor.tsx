"use client";

import type { ProgramIndicator } from "@/lib/types/sdgProgram";

const inputClass =
  "w-full rounded-lg border border-[#D7DBDF] bg-white px-3 py-2 text-sm text-[#16191D] outline-none transition focus:border-[#12A594] focus:ring-2 focus:ring-[#12A594]/20";

/** Rasio capaian satu indikator, atau null bila belum diukur. */
function ratioOf(indicator: ProgramIndicator): number | null {
  if (indicator.actual === null || indicator.target <= 0) return null;
  return indicator.actual / indicator.target;
}

function RatioLabel({ indicator }: { indicator: ProgramIndicator }) {
  const ratio = ratioOf(indicator);

  if (ratio === null) {
    return <span className="text-xs text-[#8A9099]">Belum diukur</span>;
  }

  const percent = Math.round(ratio * 100);

  // Realisasi 2x target atau lebih ditandai di sini juga, bukan hanya saat
  // disimpan, supaya salah input satuan ketahuan sejak awal.
  if (ratio >= 2) {
    return (
      <span className="text-xs font-medium text-[#B45309]">
        {percent}% — periksa satuan
      </span>
    );
  }

  const color = ratio >= 0.75 ? "#12A594" : ratio >= 0.5 ? "#B45309" : "#B91C1C";
  return (
    <span className="text-xs font-medium" style={{ color }}>
      {percent}%
    </span>
  );
}

export function IndicatorEditor({
  indicators,
  onChange,
}: {
  indicators: ProgramIndicator[];
  onChange: (indicators: ProgramIndicator[]) => void;
}) {
  function update(index: number, patch: Partial<ProgramIndicator>) {
    onChange(
      indicators.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function add() {
    onChange([
      ...indicators,
      { name: "", unit: "orang", target: 0, actual: null },
    ]);
  }

  function remove(index: number) {
    onChange(indicators.filter((_, i) => i !== index));
  }

  return (
    <section className="rounded-2xl border border-[#ECEEF0] bg-white p-6">
      <h2 className="text-base font-semibold text-[#16191D]">
        Indikator keberhasilan
      </h2>
      <p className="mt-1 text-sm text-[#8A9099]">
        Indikator yang dibiarkan kosong tetap dihitung sebagai capaian nol, agar
        kelengkapan pengukuran ikut tercermin dalam skor.
      </p>

      {indicators.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-[#D7DBDF] px-4 py-8 text-center">
          <p className="text-sm text-[#8A9099]">
            Belum ada indikator. Tambahkan minimal satu agar dampak program bisa
            diukur.
          </p>
          <button
            type="button"
            onClick={add}
            className="mt-4 rounded-lg bg-[#12A594] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0C8377]"
          >
            Tambah indikator
          </button>
        </div>
      ) : (
        <>
          <div className="mt-5 space-y-3">
            {indicators.map((indicator, index) => (
              <div
                key={index}
                className="rounded-xl border border-[#ECEEF0] bg-[#FAFBFB] p-4"
              >
                <div className="grid gap-3 sm:grid-cols-12">
                  <div className="sm:col-span-5">
                    <label className="mb-1 block text-xs font-medium text-[#5B6269]">
                      Nama indikator
                    </label>
                    <input
                      className={inputClass}
                      value={indicator.name}
                      onChange={(e) => update(index, { name: e.target.value })}
                      placeholder="Peserta lulus post-test"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-[#5B6269]">
                      Satuan
                    </label>
                    <input
                      className={inputClass}
                      value={indicator.unit}
                      onChange={(e) => update(index, { unit: e.target.value })}
                      placeholder="orang"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-[#5B6269]">
                      Target
                    </label>
                    <input
                      type="number"
                      min={0}
                      className={inputClass}
                      value={indicator.target || ""}
                      onChange={(e) =>
                        update(index, { target: Number(e.target.value) })
                      }
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-[#5B6269]">
                      Realisasi
                    </label>
                    <input
                      type="number"
                      min={0}
                      className={inputClass}
                      value={indicator.actual ?? ""}
                      onChange={(e) =>
                        update(index, {
                          actual:
                            e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                      placeholder="—"
                    />
                  </div>

                  <div className="flex items-end justify-between sm:col-span-1 sm:flex-col sm:items-end sm:gap-2">
                    <div className="pb-2">
                      <RatioLabel indicator={indicator} />
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label={`Hapus indikator ${indicator.name || index + 1}`}
                      className="pb-2 text-xs text-[#8A9099] transition hover:text-[#B91C1C]"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={add}
            className="mt-4 rounded-lg border border-[#D7DBDF] px-4 py-2 text-sm font-medium text-[#16191D] transition hover:border-[#12A594] hover:text-[#0C8377]"
          >
            Tambah indikator
          </button>
        </>
      )}
    </section>
  );
}
