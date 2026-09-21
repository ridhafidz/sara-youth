import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { FeatureGrid } from "@/components/dashboard/FeatureGrid";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { LoginNotification } from "@/components/dashboard/LoginNotification";

export const metadata: Metadata = {
  title: "Dashboard — SARA",
  description:
    "Monitor impact score, jadwal, dan distribusi program SDGs mahasiswa secara real-time.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <LoginNotification />
      </Suspense>

      {/* Hero Banner — gradient + 17 SDG icon grid */}
      <HeroBanner />

      {/* Feature Grid — 5 shortcut cards */}
      <FeatureGrid />

      {/* Distribution Chart and Recommendation Panel */}
      <DashboardCharts />
    </div>
  );
}
