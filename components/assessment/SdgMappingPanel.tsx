"use client";

import { GoalChip } from "@/components/shared/Badges";
import { SDG_GOALS, SDG_GOAL_LIST, SDG_TARGETS } from "@/lib/sdgGoals";
import type { SdgGoal } from "@/lib/types/sdgProgram";

/**
 * SDGs Mapping Panel.
 *
 * Fitur ini menjawab keluhan utama di proposal: program mahasiswa biasanya
 * hanya menyebut "mendukung SDG 4" tanpa menunjuk target spesifik. Panel ini
 * memaksa pemetaan turun satu tingkat ke kode target, karena itulah yang
 * membuat klaim kontribusi bisa diverifikasi.
 */
export function SdgMappingPanel({
  primaryGoal,
  supportingGoals,
  sdgTargets,
  onChangeSupportingGoals,
  onChangeTargets,
}: {
  primaryGoal: SdgGoal;
  supportingGoals: SdgGoal[];
  sdgTargets: string[];
  onChangeSupportingGoals: (goals: SdgGoal[]) => void;
  onChangeTargets: (targets: string[]) => void;
}) {
  const activeGoals: SdgGoal[] = [primaryGoal, ...supportingGoals];

  function toggleGoal(goal: SdgGoal) {
    if (goal === primaryGoal) return;

    if (supportingGoals.includes(goal)) {
      onChangeSupportingGoals(supportingGoals.filter((g) => g !== goal));
      // Target milik goal yang dicabut ikut dilepas agar tidak tertinggal
      // sebagai pemetaan yang tidak konsisten.
      onChangeTargets(
        sdgTargets.filter((code) => Number(code.split(".")[0]) !== goal),
      );
      return;
    }

    onChangeSupportingGoals([...supportingGoals, goal]);
  }

  function toggleTarget(code: string) {
    if (sdgTargets.includes(code)) {
      onChangeTargets(sdgTargets.filter((c) => c !== code));
      return;
    }
    onChangeTargets([...sdgTargets, code]);
  }

  return (
    <section className="rounded-2xl border border-[#ECEEF0] bg-white p-6">
      <h2 className="text-base font-semibold text-[#16191D]">
        SDGs Mapping Panel
      </h2>
      <p className="mt-1 text-sm text-[#8A9099]">
        Goal utama sudah ditetapkan saat program dibuat. Pilih goal pendukung
        bila ada, lalu tentukan target spesifik yang benar-benar disasar.
      </p>

      <div className="mt-5">
        <h3 className="mb-3 text-sm font-medium text-[#16191D]">
          Goal yang didukung
        </h3>
        {/* Tailwind hanya menyediakan grid-cols hingga 12, jadi 17 kolom
            ditulis sebagai arbitrary value. */}
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-9 lg:grid-cols-[repeat(17,minmax(0,1fr))]">
          {SDG_GOAL_LIST.map((meta) => {
            const isPrimary = meta.goal === primaryGoal;
            const isActive = activeGoals.includes(meta.goal);

            return (
              <button
                key={meta.goal}
                type="button"
                onClick={() => toggleGoal(meta.goal)}
                disabled={isPrimary}
                title={`SDG ${meta.goal}: ${meta.name}${isPrimary ? " (goal utama)" : ""}`}
                className={`relative aspect-square rounded-lg text-sm font-semibold text-white transition ${
                  isActive ? "opacity-100" : "opacity-25 hover:opacity-60"
                } ${isPrimary ? "cursor-default ring-2 ring-[#16191D] ring-offset-2" : ""}`}
                style={{ backgroundColor: meta.color }}
              >
                {meta.goal}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-[#8A9099]">
          Bertanda hitam adalah goal utama. Klik goal lain untuk menandainya
          sebagai pendukung.
        </p>
      </div>

      <div className="mt-6 border-t border-[#ECEEF0] pt-6">
        <h3 className="mb-1 text-sm font-medium text-[#16191D]">
          Target SDGs spesifik
        </h3>
        <p className="mb-4 text-xs text-[#8A9099]">
          Menyebut goal saja belum cukup. Pemetaan tanpa target spesifik
          menurunkan Impact Score dan menaikkan tingkat risiko.
        </p>

        <div className="space-y-5">
          {activeGoals.map((goal) => (
            <div key={goal}>
              <div className="mb-2 flex items-center gap-2">
                <GoalChip goal={goal} size="sm" />
                <span className="text-sm font-medium text-[#16191D]">
                  {SDG_GOALS[goal].name}
                </span>
                {goal === primaryGoal && (
                  <span className="rounded-full bg-[#E4F6F3] px-2 py-0.5 text-[11px] font-medium text-[#0C8377]">
                    utama
                  </span>
                )}
              </div>

              <div className="space-y-1.5 pl-1">
                {SDG_TARGETS[goal].map((target) => {
                  const checked = sdgTargets.includes(target.code);
                  return (
                    <label
                      key={target.code}
                      className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-[#FAFBFB]"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTarget(target.code)}
                        className="mt-0.5 h-4 w-4 rounded border-[#D7DBDF] accent-[#12A594]"
                      />
                      <span className="text-sm text-[#16191D]">
                        <span className="font-medium">{target.code}</span>{" "}
                        <span className="text-[#5B6269]">{target.label}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
