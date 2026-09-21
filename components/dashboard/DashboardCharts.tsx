"use client";

import { useEffect, useMemo, useState } from "react";

import { GoalDistributionChart } from "@/components/insights/GoalDistributionChart";
import { RecommendationPanel } from "@/components/dashboard/RecommendationPanel";
import { buildGoalDistribution } from "@/lib/insights";
import { listPrograms } from "@/lib/services/sdgPrograms";
import type { SdgProgram } from "@/lib/types/sdgProgram";

export function DashboardCharts() {
  const [programs, setPrograms] = useState<SdgProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setPrograms(await listPrograms());
      } catch {
        setError("Gagal memuat data program.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const distribution = useMemo(() => buildGoalDistribution(programs), [programs]);

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-80 animate-pulse rounded-2xl bg-[var(--sara-muted-card)]" />
        <div className="h-80 animate-pulse rounded-2xl bg-[var(--sara-muted-card)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-[#FEE2E2] px-4 py-3 text-sm text-[#B91C1C]">
        {error}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <div>
        <h2 className="mb-4 text-base font-semibold text-[var(--sara-text-primary)]">
          Distribution of Student SDGs Programs by Goal
        </h2>
        <GoalDistributionChart data={distribution} />
      </div>
      <div>
        <RecommendationPanel programs={programs} />
      </div>
    </div>
  );
}
