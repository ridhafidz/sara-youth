"use client";

import { useEffect, useMemo, useState } from "react";

import { GoalDistributionChart } from "@/components/insights/GoalDistributionChart";
import { ImpactTrendChart } from "@/components/insights/ImpactTrendChart";
import { RiskWatchlist } from "@/components/insights/RiskWatchlist";
import { SummaryCards } from "@/components/insights/SummaryCards";
import { EmptyState } from "@/components/shared/Badges";
import {
  buildGoalDistribution,
  buildRiskWatchlist,
  buildScoreTrend,
  buildSummaryStats,
} from "@/lib/insights";
import { listPrograms } from "@/lib/services/sdgPrograms";
import type { SdgProgram } from "@/lib/types/sdgProgram";

/**
 * Impact Indicator Tracker (Langkah 4).
 *
 * Seluruh chart dan tabel di sini adalah turunan dari data yang sama
 * (`listPrograms`), diproses lewat fungsi murni di lib/insights.ts.
 * Tidak ada angka yang dihitung ulang secara berbeda di dua tempat.
 */
export default function ImpactInsightsPage() {
  const [programs, setPrograms] = useState<SdgProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setPrograms(await listPrograms());
      } catch {
        setError(
          "Data program tidak bisa dimuat. Periksa koneksi, lalu muat ulang halaman.",
        );
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const stats = useMemo(() => buildSummaryStats(programs), [programs]);
  const distribution = useMemo(() => buildGoalDistribution(programs), [programs]);
  const trend = useMemo(() => buildScoreTrend(programs), [programs]);
  const watchlist = useMemo(() => buildRiskWatchlist(programs, 5), [programs]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-[#16191D]">
          Impact Insights
        </h1>
        <p className="mt-1 text-sm text-[#8A9099]">
          Gambaran menyeluruh dampak seluruh program: sebaran per goal, tren
          dari waktu ke waktu, dan program yang perlu ditindaklanjuti.
        </p>
      </header>

      {error && (
        <p className="rounded-lg bg-[#FEE2E2] px-4 py-3 text-sm text-[#B91C1C]">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#F1F3F4]" />
            ))}
          </div>
          <div className="h-80 animate-pulse rounded-2xl bg-[#F1F3F4]" />
        </div>
      ) : programs.length === 0 ? (
        <EmptyState
          title="Belum ada data untuk ditampilkan"
          description="Insight akan muncul setelah ada program yang terdaftar dan dinilai dampaknya."
        />
      ) : (
        <>
          <SummaryCards stats={stats} />
          <GoalDistributionChart data={distribution} />
          <div className="grid gap-6 lg:grid-cols-2">
            <ImpactTrendChart data={trend} />
            <RiskWatchlist programs={watchlist} />
          </div>
        </>
      )}
    </div>
  );
}
