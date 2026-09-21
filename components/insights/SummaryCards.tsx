import type { SummaryStats } from "@/lib/insights";

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "danger";
}) {
  return (
    <div className="rounded-2xl border border-[var(--sara-border)] bg-[var(--sara-surface)] p-5">
      <p className="text-xs font-medium text-[var(--sara-text-secondary)]">{label}</p>
      <p
        className={`mt-2 text-2xl font-semibold tabular-nums ${
          accent === "danger" ? "text-[#B91C1C]" : "text-[var(--sara-text-primary)]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function SummaryCards({ stats }: { stats: SummaryStats }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="Total program" value={String(stats.totalPrograms)} />
      <StatCard
        label="Sudah diukur"
        value={`${stats.measuredPrograms} / ${stats.totalPrograms}`}
      />
      <StatCard
        label="Rata-rata Impact Score"
        value={stats.averageScore === null ? "—" : String(stats.averageScore)}
      />
      <StatCard
        label="Program risiko tinggi"
        value={String(stats.highRiskCount)}
        accent={stats.highRiskCount > 0 ? "danger" : undefined}
      />
    </div>
  );
}
