import type { Metadata } from "next";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { FeatureGrid } from "@/components/dashboard/FeatureGrid";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";

export const metadata: Metadata = {
  title: "Dashboard — SARA",
  description:
    "Monitor impact score, jadwal, dan distribusi program SDGs mahasiswa secara real-time.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Hero Banner — gradient + 17 SDG icon grid */}
      <HeroBanner />

      {/* Feature Grid — 5 shortcut cards */}
      <FeatureGrid />

      {/* Distribution Chart and Recommendation Panel */}
      <DashboardCharts />
    </div>
  );
}
