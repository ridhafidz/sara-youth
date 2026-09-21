import { SDG_GOALS } from "@/lib/sdgGoals";
import type { ProgramStatus, RiskLevel, SdgGoal } from "@/lib/types/sdgProgram";

/** Chip bernomor dengan warna resmi goal SDGs. */
export function GoalChip({
  goal,
  showName = false,
  size = "md",
}: {
  goal: SdgGoal;
  showName?: boolean;
  size?: "sm" | "md";
}) {
  const meta = SDG_GOALS[goal];
  const box = size === "sm" ? "h-6 w-6 text-[11px]" : "h-8 w-8 text-sm";

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`${box} inline-flex shrink-0 items-center justify-center rounded-md font-semibold text-white`}
        style={{ backgroundColor: meta.color }}
        aria-hidden="true"
      >
        {goal}
      </span>
      <span className="sr-only">{`SDG ${goal}: ${meta.name}`}</span>
      {showName && (
        <span className="text-sm text-[var(--sara-text-primary)]">{meta.shortName}</span>
      )}
    </span>
  );
}

const STATUS_STYLE: Record<ProgramStatus, { label: string; className: string }> = {
  draft: { label: "Belum diukur", className: "bg-[var(--sara-muted-card)] text-[#5B6269]" },
  measured: { label: "Sudah diukur", className: "bg-[#E4F6F3] text-[#0C8377]" },
  reported: { label: "Dilaporkan", className: "bg-[#DBEAFE] text-[#1D4ED8]" },
};

export function StatusBadge({ status }: { status: ProgramStatus }) {
  const style = STATUS_STYLE[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${style.className}`}
    >
      {style.label}
    </span>
  );
}

const RISK_STYLE: Record<RiskLevel, { label: string; className: string }> = {
  low: { label: "Risiko rendah", className: "bg-[#DCFCE7] text-[#15803D]" },
  medium: { label: "Risiko sedang", className: "bg-[#FEF3C7] text-[#B45309]" },
  high: { label: "Risiko tinggi", className: "bg-[#FEE2E2] text-[#B91C1C]" },
};

export function RiskBadge({ risk }: { risk: RiskLevel | null }) {
  if (risk === null) {
    return <span className="text-sm text-[var(--sara-text-secondary)]">—</span>;
  }
  const style = RISK_STYLE[risk];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {style.label}
    </span>
  );
}

/** Skor dengan bar tipis di bawahnya. */
export function ScoreCell({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-sm text-[var(--sara-text-secondary)]">Belum diukur</span>;
  }

  const color =
    score >= 75 ? "#12A594" : score >= 50 ? "#F59E0B" : "#E5243B";

  return (
    <div className="w-24">
      <div className="text-sm font-semibold text-[var(--sara-text-primary)]">{score}</div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#ECEEF0]">
        <div
          className="h-full rounded-full"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/** Tampilan saat belum ada data. Selalu sertakan langkah berikutnya. */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--sara-border)] bg-[var(--sara-surface)] px-6 py-14 text-center">
      <h3 className="text-base font-semibold text-[var(--sara-text-primary)]">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-[var(--sara-text-secondary)]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
