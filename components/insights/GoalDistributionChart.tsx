"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { GoalDistributionPoint } from "@/lib/insights";

type Metric = "programCount" | "averageScore";

const METRIC_LABEL: Record<Metric, string> = {
  programCount: "Jumlah program",
  averageScore: "Rata-rata skor",
};

interface TooltipPayloadItem {
  payload: GoalDistributionPoint;
}

function ChartTooltip({
  active,
  payload,
  metric,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  metric: Metric;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-[var(--sara-border)] bg-[var(--sara-surface)] px-3 py-2 text-xs shadow-[0_1px_3px_rgba(16,24,40,0.08)]">
      <p className="font-medium text-[var(--sara-text-primary)]">
        SDG {point.goal} — {point.shortName}
      </p>
      <p className="mt-1 text-[#5B6269]">
        {METRIC_LABEL[metric]}:{" "}
        <span className="font-medium text-[var(--sara-text-primary)]">
          {metric === "averageScore"
            ? (point.averageScore ?? "belum diukur")
            : point.programCount}
        </span>
      </p>
      {point.highRiskCount > 0 && (
        <p className="mt-0.5 text-[#B91C1C]">
          {point.highRiskCount} program risiko tinggi
        </p>
      )}
    </div>
  );
}

/**
 * Chart "Distribution of Student SDGs Programs by Goal".
 * Dipakai di halaman Impact Insights, dan bisa dipasang ulang di dashboard
 * utama (komponen yang sama, data yang sama, sehingga angkanya tidak pernah
 * berbeda antara dua halaman).
 */
export function GoalDistributionChart({
  data,
}: {
  data: GoalDistributionPoint[];
}) {
  const [metric, setMetric] = useState<Metric>("programCount");

  const chartData = data.map((point) => ({
    ...point,
    value: metric === "programCount" ? point.programCount : point.averageScore ?? 0,
  }));

  const hasAnyData = data.some((point) => point.programCount > 0);

  return (
    <section className="rounded-2xl border border-[var(--sara-border)] bg-[var(--sara-surface)] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--sara-text-primary)]">
            Distribution of Student SDGs Programs by Goal
          </h2>
          <p className="mt-1 text-sm text-[var(--sara-text-secondary)]">
            Sebaran program mahasiswa di antara 17 tujuan SDGs.
          </p>
        </div>

        <div className="flex rounded-lg border border-[var(--sara-border)] p-0.5">
          {(["programCount", "averageScore"] as Metric[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMetric(option)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                metric === option
                  ? "bg-[#12A594] text-white"
                  : "text-[#5B6269] hover:bg-[var(--sara-muted-card)]"
              }`}
            >
              {METRIC_LABEL[option]}
            </button>
          ))}
        </div>
      </div>

      {!hasAnyData ? (
        <p className="mt-8 py-10 text-center text-sm text-[var(--sara-text-secondary)]">
          Belum ada program yang terdaftar pada goal mana pun.
        </p>
      ) : (
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <XAxis
                dataKey="goal"
                tick={{ fontSize: 11, fill: "#8A9099" }}
                axisLine={{ stroke: "#ECEEF0" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#8A9099" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={<ChartTooltip metric={metric} />}
                cursor={{ fill: "#F1F3F4" }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={28}>
                {chartData.map((point) => (
                  <Cell key={point.goal} fill={point.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
