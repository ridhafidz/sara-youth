"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { GoalChip, RiskBadge, ScoreCell, StatusBadge } from "@/components/shared/Badges";
import { SDG_GOAL_LIST } from "@/lib/sdgGoals";
import type { ProgramStatus, SdgProgram } from "@/lib/types/sdgProgram";

const selectClass =
  "rounded-lg border border-[#D7DBDF] bg-white px-3 py-2 text-sm text-[#16191D] outline-none focus:border-[#12A594]";

export function ProgramTable({
  programs,
  onEdit,
  onDelete,
}: {
  programs: SdgProgram[];
  onEdit: (program: SdgProgram) => void;
  onDelete: (program: SdgProgram) => void;
}) {
  const [goalFilter, setGoalFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return programs.filter((program) => {
      if (goalFilter !== "all" && String(program.primaryGoal) !== goalFilter) {
        return false;
      }
      if (statusFilter !== "all" && program.status !== statusFilter) {
        return false;
      }
      if (keyword) {
        const haystack =
          `${program.programName} ${program.organization}`.toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }
      return true;
    });
  }, [programs, goalFilter, statusFilter, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          className={`${selectClass} min-w-[220px] flex-1`}
          placeholder="Cari nama program atau organisasi"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={selectClass}
          value={goalFilter}
          onChange={(e) => setGoalFilter(e.target.value)}
          aria-label="Saring berdasarkan goal"
        >
          <option value="all">Semua goal</option>
          {SDG_GOAL_LIST.map((goal) => (
            <option key={goal.goal} value={goal.goal}>
              {goal.goal}. {goal.shortName}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Saring berdasarkan status"
        >
          <option value="all">Semua status</option>
          <option value="draft">Belum diukur</option>
          <option value="measured">Sudah diukur</option>
          <option value="reported">Dilaporkan</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#ECEEF0] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-[#ECEEF0] bg-[#FAFBFB]">
                <th className="px-5 py-3 text-xs font-semibold text-[#5B6269]">
                  Program
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-[#5B6269]">
                  Goal
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-[#5B6269]">
                  Status
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-[#5B6269]">
                  Impact Score
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-[#5B6269]">
                  Risiko
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[#5B6269]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((program) => (
                <tr
                  key={program.id}
                  className="border-b border-[#ECEEF0] last:border-0 transition hover:bg-[#FAFBFB]"
                >
                  <td className="px-5 py-4">
                    <div className="font-medium text-[#16191D]">
                      {program.programName}
                    </div>
                    <div className="text-xs text-[#8A9099]">
                      {program.organization}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <GoalChip goal={program.primaryGoal} size="sm" />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={program.status as ProgramStatus} />
                  </td>
                  <td className="px-5 py-4">
                    <ScoreCell score={program.impactScore} />
                  </td>
                  <td className="px-5 py-4">
                    <RiskBadge risk={program.riskLevel} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-3 text-sm">
                      <Link
                        href={`/impact-assessment/${program.id}`}
                        className="font-medium text-[#12A594] transition hover:text-[#0C8377]"
                      >
                        {program.status === "draft" ? "Ukur dampak" : "Lihat penilaian"}
                      </Link>
                      <button
                        onClick={() => onEdit(program)}
                        className="text-[#5B6269] transition hover:text-[#16191D]"
                      >
                        Ubah
                      </button>
                      <button
                        onClick={() => onDelete(program)}
                        className="text-[#5B6269] transition hover:text-[#B91C1C]"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-[#8A9099]">
            Tidak ada program yang cocok dengan filter ini. Ubah kata kunci atau
            pilih goal lain.
          </p>
        )}
      </div>

      <p className="text-xs text-[#8A9099]">
        Menampilkan {filtered.length} dari {programs.length} program.
      </p>
    </div>
  );
}
