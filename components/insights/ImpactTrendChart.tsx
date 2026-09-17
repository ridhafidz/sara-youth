"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TrendPoint } from "@/lib/insights";

interface TooltipPayloadItem {
  payload: TrendPoint;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-[#ECEEF0] bg-white px-3 py-2 text-xs shadow-[0_1px_3px_rgba(16,24,40,0.08)]">
      <p className="font-medium text-[#16191D]">{point.monthLabel}</p>
      <p className="mt-1 text-[#5B6269]">
        Rata-rata skor:{" "}
        <span className="font-medium text-[#16191D]">{point.averageScore}</span>
      </p>
      <p className="text-[#5B6269]">
        {point.programCount} program dinilai
      </p>
    </div>
  );
}

/**
 * Tren Impact Score dari bulan ke bulan.
 * Butuh minimal dua titik data untuk bermakna sebagai tren; di bawah itu
 * ditampilkan pesan alih-alih grafik nyaris kosong.
 */
export function ImpactTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <section className="rounded-2xl border border-[#ECEEF0] bg-white p-6">
      <h2 className="text-base font-semibold text-[#16191D]">
        Tren Impact Score
      </h2>
      <p className="mt-1 text-sm text-[#8A9099]">
        Rata-rata skor program yang dinilai setiap bulan.
      </p>

      {data.length < 2 ? (
        <p className="mt-8 py-10 text-center text-sm text-[#8A9099]">
          Tren baru bisa ditampilkan setelah ada penilaian pada minimal dua
          bulan berbeda.
        </p>
      ) : (
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="#ECEEF0" vertical={false} />
              <XAxis
                dataKey="monthLabel"
                tick={{ fontSize: 11, fill: "#8A9099" }}
                axisLine={{ stroke: "#ECEEF0" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "#8A9099" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="averageScore"
                stroke="#12A594"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#12A594" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
